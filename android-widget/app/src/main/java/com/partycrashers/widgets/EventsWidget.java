package com.partycrashers.widgets;
import android.app.*;
import android.appwidget.*;
import android.content.*;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;
import org.json.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
public class EventsWidget extends AppWidgetProvider {
 public static final String REFRESH="com.partycrashers.widgets.REFRESH";
 public static android.content.SharedPreferences prefs(Context c,int id){return c.getSharedPreferences("widget-"+id,Context.MODE_PRIVATE);}
 @Override public void onEnabled(Context c){WidgetRefreshService.schedule(c,true);}
 @Override public void onUpdate(Context c,AppWidgetManager manager,int[] ids){for(int id:ids)render(c,id);WidgetRefreshService.schedule(c,false);}
 @Override public void onDisabled(Context c){WidgetRefreshService.cancel(c);}
 @Override public void onDeleted(Context c,int[] ids){for(int id:ids)prefs(c,id).edit().clear().apply();}
 @Override public void onReceive(Context c,Intent intent){super.onReceive(c,intent);if(REFRESH.equals(intent.getAction()))WidgetRefreshService.schedule(c,false);}
 public static int[] ids(Context c){return AppWidgetManager.getInstance(c).getAppWidgetIds(new ComponentName(c,EventsWidget.class));}
 private static PendingIntent browser(Context c,String id){Intent intent=new Intent(Intent.ACTION_VIEW,Uri.parse("https://party-crashers-seven.vercel.app/#event/"+Uri.encode(id)));return PendingIntent.getActivity(c,id.hashCode(),intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);}
 public static void render(Context c,int id){
  var p=prefs(c,id);RemoteViews views=new RemoteViews(c.getPackageName(),R.layout.events_widget);
  String area=p.getString("area","Anywhere in Lagos");views.setTextViewText(R.id.widget_area,area);views.removeAllViews(R.id.widget_rows);
  Intent setup=new Intent(c,WidgetSetupActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);PendingIntent settings=PendingIntent.getActivity(c,id,setup,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);views.setOnClickPendingIntent(R.id.widget_heading,settings);views.setOnClickPendingIntent(R.id.widget_status,settings);
  PendingIntent refresh=PendingIntent.getBroadcast(c,0,new Intent(c,EventsWidget.class).setAction(REFRESH),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);views.setOnClickPendingIntent(R.id.widget_refresh,refresh);
  int count=0;try{JSONArray events=new JSONArray(p.getString("cache","[]"));for(int n=0;n<events.length()&&count<3;n++){JSONObject e=events.getJSONObject(n);if(OffsetDateTime.parse(e.getString("endDate")).toInstant().isBefore(Instant.now()))continue;RemoteViews row=new RemoteViews(c.getPackageName(),R.layout.event_row);row.setTextViewText(R.id.event_title,e.getString("title"));String date=OffsetDateTime.parse(e.getString("startDate")).atZoneSameInstant(ZoneId.of("Africa/Lagos")).format(DateTimeFormatter.ofPattern("d MMM",Locale.UK));row.setTextViewText(R.id.event_meta,date+" · "+e.optString("venueName",e.optString("area")));row.setOnClickPendingIntent(R.id.event_row,browser(c,e.getString("id")));views.addView(R.id.widget_rows,row);count++;}}catch(Exception ignored){}
  String last=p.getString("updated","");String status=!p.getBoolean("configured",false)?"Tap to choose interests and area":p.getBoolean("failed",false)?"Offline · showing saved plans · tap Refresh":count==0?"No matching events yet · tap to change filters":"Updated "+last+" · tap here to change filters";views.setTextViewText(R.id.widget_status,status);AppWidgetManager.getInstance(c).updateAppWidget(id,views);
 }
}
