using System;
using System.Collections.Generic;
using Valve.VR;

public partial class OrbitVR {
 static HmdMatrix34_t fixtureRoom=Identity();
 static string Universe(){if(fixture)return "fixture-universe";var error=ETrackedPropertyError.TrackedProp_Success;ulong v=system.GetUint64TrackedDeviceProperty(0,ETrackedDeviceProperty.Prop_CurrentUniverseId_Uint64,ref error);if(error!=ETrackedPropertyError.TrackedProp_Success||v==0)throw new Exception("The tracking universe is unavailable.");return v.ToString();}
 static HmdMatrix34_t CurrentRoom(){if(fixture)return fixtureRoom;if(OpenVR.Chaperone.GetCalibrationState()!=ChaperoneCalibrationState.OK)throw new Exception("Finish SteamVR room setup first.");OpenVR.ChaperoneSetup.RevertWorkingCopy();var m=Identity();if(!OpenVR.ChaperoneSetup.GetWorkingStandingZeroPoseToRawTrackingPose(ref m))throw new Exception("SteamVR room calibration is unavailable.");return m;}
 static float[] ArrayValue(Dictionary<string,object> c,string key){object o;if(!c.TryGetValue(key,out o))throw new Exception("Missing room backup.");var a=o as System.Collections.IList;if(a==null||a.Count!=12)throw new Exception("Invalid room backup.");var b=new float[12];for(int i=0;i<12;i++){b[i]=Convert.ToSingle(a[i]);if(float.IsNaN(b[i])||float.IsInfinity(b[i])||Math.Abs(b[i])>10000)throw new Exception("Invalid room transform.");}return b;}
 static bool Same(HmdMatrix34_t a,HmdMatrix34_t b){var x=Values(a);var y=Values(b);for(int i=0;i<12;i++)if(Math.Abs(x[i]-y[i])>.0001)return false;return true;}
 static HmdMatrix34_t Offset(HmdMatrix34_t current,double height,double yaw){var local=Rotation(yaw,0);local.m7=(float)height;return Multiply(current,local);}
 static void RoomTests(){var a=Offset(Identity(),.1,90);if(Math.Abs(a.m7-.1)>.00001||Math.Abs(a.m2-1)>.00001||Same(a,Identity()))throw new Exception("Room offset math failed.");}
 // Caller durably saves before/target before sending this compare-and-swap command.
 static object RoomCommand(Dictionary<string,object> c){var current=CurrentRoom();string universe=Universe();if(Text(c,"type")=="room-read")return new{matrix=Values(current),universe=universe};if(Text(c,"confirmed").ToLower()!="true")throw new Exception("Confirm the playspace change while standing still.");if(Text(c,"universe")!=universe)throw new Exception("Room setup changed. No calibration was altered.");var expected=Matrix(ArrayValue(c,"expected"));if(!Same(current,expected))throw new Exception("Another tool changed your playspace. Orbit left it untouched.");var target=Matrix(ArrayValue(c,"target"));if(!fixture){OpenVR.ChaperoneSetup.SetWorkingStandingZeroPoseToRawTrackingPose(ref target);if(!OpenVR.ChaperoneSetup.CommitWorkingCopy(EChaperoneConfigFile.Live)){OpenVR.ChaperoneSetup.RevertWorkingCopy();throw new Exception("SteamVR did not save the offset.");}}else fixtureRoom=target;return new{matrix=Values(target),universe=universe};}
}
