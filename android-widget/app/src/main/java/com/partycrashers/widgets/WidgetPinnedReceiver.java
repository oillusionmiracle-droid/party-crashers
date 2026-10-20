package com.partycrashers.widgets;
import android.appwidget.AppWidgetManager;
import android.content.*;
import java.util.ArrayList;
public class WidgetPinnedReceiver extends BroadcastReceiver {
 @Override public void onReceive(Context context,Intent intent){int id=intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);ArrayList<String> interests=intent.getStringArrayListExtra("interests");if(id!=AppWidgetManager.INVALID_APPWIDGET_ID&&interests!=null)WidgetSetupActivity.save(context,id,intent.getStringExtra("area"),interests);}
}
