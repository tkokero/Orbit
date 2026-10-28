#define DISCORDPP_IMPLEMENTATION
#include "discordpp.h"
#include "vendor/json.hpp"
#include <windows.h>
#include <wincrypt.h>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <thread>
#include <mutex>
#include <deque>
#include <chrono>
#include <sstream>
#include <set>
using json = nlohmann::json;
namespace fs = std::filesystem;
constexpr uint64_t AppId = 1562367343601123348ULL;
std::mutex inputMutex; std::deque<json> commands; bool inputEnded=false;
void reply(int id, const json& data) { std::cout << json{{"id",id},{"ok",true},{"data",data}}.dump(-1,' ',false,json::error_handler_t::replace) << std::endl; }
void fail(int id,const std::string& code) { if(id) std::cout << json{{"id",id},{"ok",false},{"code",code}}.dump() << std::endl; }
int main(int argc,char** argv) {
 if(argc!=3) return 2;
 SetErrorMode(SEM_FAILCRITICALERRORS|SEM_NOGPFAULTERRORBOX|SEM_NOOPENFILEERRORBOX);
 const fs::path vault=fs::u8path(argv[1]);
 auto clearVault=[&](){ std::error_code ec; fs::remove(vault,ec); if(ec) throw std::runtime_error("vault"); };
 auto saveVault=[&](const std::string& token) {
  DATA_BLOB input{static_cast<DWORD>(token.size()),reinterpret_cast<BYTE*>(const_cast<char*>(token.data()))},output{};
  if(!CryptProtectData(&input,L"Orbit Discord",nullptr,nullptr,nullptr,CRYPTPROTECT_UI_FORBIDDEN,&output)) throw std::runtime_error("vault");
  std::vector<char> encrypted(output.pbData,output.pbData+output.cbData);LocalFree(output.pbData);
  fs::create_directories(vault.parent_path()); auto temp=vault; temp+=L".tmp";
  { std::ofstream file(temp,std::ios::binary|std::ios::trunc); file.write(encrypted.data(),encrypted.size());if(!file) throw std::runtime_error("vault"); }
  if(!MoveFileExW(temp.c_str(),vault.c_str(),MOVEFILE_REPLACE_EXISTING|MOVEFILE_WRITE_THROUGH)) throw std::runtime_error("vault");
 };
 auto loadVault=[&]()->std::string {
  if(!fs::exists(vault)||fs::file_size(vault)>32768) return {};
  std::ifstream file(vault,std::ios::binary);std::vector<char> bytes((std::istreambuf_iterator<char>(file)),{});if(bytes.empty()) return {};
  DATA_BLOB input{static_cast<DWORD>(bytes.size()),reinterpret_cast<BYTE*>(bytes.data())},output{};
  if(!CryptUnprotectData(&input,nullptr,nullptr,nullptr,nullptr,CRYPTPROTECT_UI_FORBIDDEN,&output)) return {};
  std::string result(reinterpret_cast<char*>(output.pbData),output.cbData);SecureZeroMemory(output.pbData,output.cbData);LocalFree(output.pbData);return result;
 };
 std::thread([](){ std::string line;while(std::getline(std::cin,line)){if(line.size()>16384) break;auto row=json::parse(line,nullptr,false);if(row.is_discarded()) break;std::lock_guard lock(inputMutex);if(commands.size()>=32) break;commands.push_back(std::move(row));} std::lock_guard lock(inputMutex);inputEnded=true; }).detach();
 auto client=std::make_shared<discordpp::Client>(); client->SetGameWindowPid(std::stoi(argv[2]));
 bool ready=false,remember=false,running=true,refreshing=false;int pending=0;uint64_t generation=0;std::string access,refresh,grantedScope;auto renew=std::chrono::steady_clock::time_point::max();
 auto snapshot=[&](){
  json rows=json::array();json self=nullptr;
  return json{{"connected",ready},{"saved",remember&&fs::exists(vault)},{"friends",rows},{"self",self}};
 };
 auto acceptToken=[&](uint64_t epoch,auto result,std::string nextAccess,std::string nextRefresh,auto tokenType,int32_t expiresIn,std::string scope){
  if(epoch!=generation)return;refreshing=false;
  if(!result.Successful()){ready=false;client->Disconnect();refresh.clear();renew=std::chrono::steady_clock::time_point::max();if(pending){fail(pending,"authorization");pending=0;}return;}
  std::istringstream words(scope);std::set<std::string> granted;for(std::string word;words>>word;)granted.insert(word);
  if(!granted.contains("relationships.read")||std::any_of(granted.begin(),granted.end(),[](const auto& item){return item!="openid"&&item!="identify"&&item!="relationships.read";})){int id=pending;pending=0;client->RevokeToken(AppId,nextAccess,[id](auto){fail(id,"permissions");});return;}
  access=nextAccess;refresh=nextRefresh;grantedScope=scope;
  try{if(remember)saveVault(refresh);}catch(...){remember=false;fail(pending,"secure-storage");pending=0;client->Disconnect();return;}
  renew=std::chrono::steady_clock::now()+std::chrono::seconds(std::max(30,expiresIn-120));
  ready=true;if(pending){int id=pending;pending=0;reply(id,json{{"connected",true},{"saved",remember&&fs::exists(vault)},{"token",access},{"scope",grantedScope}});}
 };
 while(running){
  std::deque<json> next;{std::lock_guard lock(inputMutex);next.swap(commands);if(inputEnded&&next.empty())break;}
  for(auto& row:next){int id=0;try{
   id=row.at("id").get<int>();const auto op=row.at("method").get<std::string>();
   if(op=="snapshot")reply(id,snapshot());
   else if(op=="token")reply(id,json{{"connected",ready},{"saved",remember&&fs::exists(vault)},{"token",access},{"scope",grantedScope}});
   else if(op=="connect"||op=="resume"){
    if(pending){fail(id,"busy");continue;}const auto epoch=++generation;ready=false;refreshing=false;client->Disconnect();remember=row.value("remember",false);pending=id;
    if(op=="resume"){
     refresh=loadVault();if(refresh.empty()){pending=0;remember=false;reply(id,snapshot());continue;}
     client->RefreshToken(AppId,refresh,[&,epoch](auto...args){acceptToken(epoch,args...);});
    }else{
     if(!remember)clearVault();auto verifier=client->CreateAuthorizationCodeVerifier();discordpp::AuthorizationArgs args;
     args.SetClientId(AppId);args.SetScopes("identify relationships.read");args.SetCodeChallenge(verifier.Challenge());
     client->Authorize(args,[&,epoch,verifier](auto result,auto code,auto redirect){if(epoch!=generation)return;if(!result.Successful()){fail(pending,"authorization");pending=0;return;}client->GetToken(AppId,code,verifier.Verifier(),redirect,[&,epoch](auto...args){acceptToken(epoch,args...);});});
    }
   }else if(op=="forget"){remember=false;clearVault();reply(id,snapshot());}
   else if(op=="disconnect"){
    ++generation;if(pending){fail(pending,"cancelled");pending=0;}remember=false;clearVault();ready=false;renew=std::chrono::steady_clock::time_point::max();
    auto token=access;client->Disconnect();access.clear();refresh.clear();if(!token.empty())client->RevokeToken(AppId,token,[&,id](auto){reply(id,snapshot());});else reply(id,snapshot());
   }else if(op=="close"){reply(id,json::object());running=false;}
   else fail(id,"unsupported");
  }catch(...){fail(id,"invalid-request");}}
  if(ready&&!refreshing&&!refresh.empty()&&std::chrono::steady_clock::now()>=renew){refreshing=true;auto epoch=generation;client->RefreshToken(AppId,refresh,[&,epoch](auto...args){acceptToken(epoch,args...);});}
  discordpp::RunCallbacks();std::this_thread::sleep_for(std::chrono::milliseconds(15));
 }
 client->Disconnect();return 0;
}
