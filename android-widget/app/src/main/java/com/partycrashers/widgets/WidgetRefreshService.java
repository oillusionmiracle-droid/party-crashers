package com.partycrashers.widgets;
import android.app.job.*;
import android.content.*;
import org.json.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
public class WidgetRefreshService extends JobService {
 private static final int PERIODIC=24010,ONCE=24011;private volatile boolean stopped=false;
 public static void schedule(Context c,boolean periodic){JobScheduler jobs=(JobScheduler)c.getSystemService(JOB_SCHEDULER_SERVICE);JobInfo.Builder b=new JobInfo.Builder(periodic?PERIODIC:ONCE,new ComponentName(c,WidgetRefreshService.class)).setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY);if(periodic)b.setPeriodic(30*60*1000).setPersisted(true);jobs.schedule(b.build());}
 public static void cancel(Context c){JobScheduler jobs=(JobScheduler)c.getSystemService(JOB_SCHEDULER_SERVICE);jobs.cancel(PERIODIC);jobs.cancel(ONCE);}
 @Override public boolean onStartJob(JobParameters params){stopped=false;new Thread(()->{boolean failed=false;try{
  HttpURLConnection conn=(HttpURLConnection)new URL("https://aqwnluhpnqsrofmvtngp.supabase.co/functions/v1/pc-api").openConnection();conn.setConnectTimeout(10000);conn.setReadTimeout(10000);conn.setInstanceFollowRedirects(false);conn.setRequestProperty("Accept","application/json");
  byte[] bytes;try(InputStream stream=conn.getInputStream();ByteArrayOutputStream out=new ByteArrayOutputStream()){byte[] buf=new byte[8192];int n;while((n=stream.read(buf))!=-1){if(out.size()+n>2000000)throw new IOException("Feed too large");out.write(buf,0,n);}bytes=out.toByteArray();}finally{conn.disconnect();}
  JSONArray records=new JSONObject(new String(bytes,StandardCharsets.UTF_8)).getJSONArray("events");
  for(int id:EventsWidget.ids(this)){if(stopped)break;var p=EventsWidget.prefs(this,id);if(!p.getBoolean("configured",false))continue;Set<String> interests=p.getStringSet("interests",Collections.emptySet());String area=p.getString("area","Anywhere in Lagos");List<JSONObject> matches=new ArrayList<>();
   for(int i=0;i<records.length();i++){JSONObject e=records.getJSONObject(i);if(!e.optString("status").equals("published")||OffsetDateTime.parse(e.getString("endDate")).toInstant().isBefore(Instant.now()))continue;List<String> tags=new ArrayList<>();JSONArray raw=e.optJSONArray("tags");if(raw!=null)for(int k=0;k<raw.length();k++)tags.add(raw.optString(k));if(EventMatch.matches(e.optString("category"),tags,e.optString("area"),e.optString("format"),interests,area))matches.add(e);}
   matches.sort(Comparator.comparing(e->e.optString("startDate")));JSONArray cache=new JSONArray();for(int n=0;n<Math.min(3,matches.size());n++)cache.put(matches.get(n));p.edit().putString("cache",cache.toString()).putString("updated",ZonedDateTime.now(ZoneId.of("Africa/Lagos")).format(DateTimeFormatter.ofPattern("HH:mm"))).putBoolean("failed",false).apply();EventsWidget.render(this,id);
  }
 }catch(Exception ignored){failed=true;for(int id:EventsWidget.ids(this)){EventsWidget.prefs(this,id).edit().putBoolean("failed",true).apply();EventsWidget.render(this,id);}}finally{if(!stopped)jobFinished(params,failed);}},"pc-widget-refresh").start();return true;}
 @Override public boolean onStopJob(JobParameters params){stopped=true;return true;}
}
