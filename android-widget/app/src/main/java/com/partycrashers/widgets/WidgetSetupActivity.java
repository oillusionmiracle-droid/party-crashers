package com.partycrashers.widgets;
import android.app.*;
import android.appwidget.*;
import android.content.*;
import android.content.res.ColorStateList;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.*;
import android.widget.*;
import java.util.*;
public class WidgetSetupActivity extends Activity {
 private int widgetId=AppWidgetManager.INVALID_APPWIDGET_ID;
 private final Map<String,CheckBox> choices=new LinkedHashMap<>();
 private static final String[] CATEGORIES={"Tech","Startups","Business","Career","Design","Music","Parties","Gaming","Fashion","Art","Sports","Faith","Education","Food","Campus","Community","Comedy","Film","Health","Weddings"};
 private static final String[] AREAS={"Anywhere in Lagos","Yaba","Ikeja","Surulere","VI","Lekki","Ajah","Ojo","Festac","Mainland","Lagos Island"};
 private int dp(int n){return Math.round(n*getResources().getDisplayMetrics().density);}
 private TextView text(String value,int size,boolean bold){TextView t=new TextView(this);t.setText(value);t.setTextSize(size);t.setTextColor(getColor(R.color.widget_text));if(bold)t.setTypeface(null,Typeface.BOLD);t.setPadding(0,dp(10),0,dp(10));return t;}
 @Override public void onCreate(Bundle state){super.onCreate(state);setResult(RESULT_CANCELED);widgetId=getIntent().getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);
  Set<String> selected=new HashSet<>();String selectedArea="Anywhere in Lagos";
  if(widgetId!=AppWidgetManager.INVALID_APPWIDGET_ID){var p=EventsWidget.prefs(this,widgetId);selected.addAll(p.getStringSet("interests",Collections.emptySet()));selectedArea=p.getString("area",selectedArea);}
  Uri link=getIntent().getData();if(link!=null&&"partycrashers".equals(link.getScheme())&&"widget".equals(link.getHost())&&"/setup".equals(link.getPath())){String area=link.getQueryParameter("area");if(Arrays.asList(AREAS).contains(area))selectedArea=area;String interests=link.getQueryParameter("interests");if(interests!=null)for(String i:interests.split(","))if(Arrays.asList(CATEGORIES).contains(i))selected.add(i);}
  LinearLayout body=new LinearLayout(this);body.setOrientation(LinearLayout.VERTICAL);body.setPadding(dp(24),dp(32),dp(24),dp(32));body.setBackgroundColor(getColor(R.color.widget_background));ScrollView scroll=new ScrollView(this);scroll.addView(body);setContentView(scroll);
  ImageView logo=new ImageView(this);logo.setImageResource(R.drawable.app_icon);body.addView(logo,new LinearLayout.LayoutParams(dp(64),dp(64)));
  body.addView(text("Your plans.\nOn your home screen.",30,true));body.addView(text("Choose an area and interests for this widget. These choices stay on this phone. No GPS permission is needed.",14,false));
  body.addView(text("AREA",12,true));Spinner area=new Spinner(this);ArrayAdapter<String> adapter=new ArrayAdapter<String>(this,android.R.layout.simple_spinner_item,AREAS){@Override public android.view.View getView(int n,android.view.View v,android.view.ViewGroup parent){TextView t=(TextView)super.getView(n,v,parent);t.setTextColor(getColor(R.color.widget_text));return t;}};adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);area.setAdapter(adapter);area.setSelection(Arrays.asList(AREAS).indexOf(selectedArea));body.addView(area,new LinearLayout.LayoutParams(-1,dp(56)));
  body.addView(text("YOUR INTERESTS",12,true));GridLayout grid=new GridLayout(this);grid.setColumnCount(2);for(int n=0;n<CATEGORIES.length;n++){String category=CATEGORIES[n];CheckBox check=new CheckBox(this);check.setText(category);check.setTextSize(14);check.setTextColor(getColor(R.color.widget_text));check.setButtonTintList(ColorStateList.valueOf(0xffff6a1a));check.setChecked(selected.contains(category));choices.put(category,check);GridLayout.LayoutParams params=new GridLayout.LayoutParams();params.columnSpec=GridLayout.spec(n%2,1f);params.rowSpec=GridLayout.spec(n/2);params.width=0;grid.addView(check,params);}body.addView(grid);
  Button save=new Button(this);save.setText(widgetId==AppWidgetManager.INVALID_APPWIDGET_ID?"Add to home screen":"Save widget");save.setBackgroundTintList(ColorStateList.valueOf(0xffff6a1a));save.setTextColor(0xff111315);body.addView(save);save.setOnClickListener(v->{ArrayList<String> interests=new ArrayList<>();for(var entry:choices.entrySet())if(entry.getValue().isChecked())interests.add(entry.getKey());if(interests.isEmpty()){Toast.makeText(this,"Choose at least one interest",Toast.LENGTH_SHORT).show();return;}String chosenArea=(String)area.getSelectedItem();if(widgetId!=AppWidgetManager.INVALID_APPWIDGET_ID){save(this,widgetId,chosenArea,interests);setResult(RESULT_OK,new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,widgetId));finish();}else{AppWidgetManager manager=AppWidgetManager.getInstance(this);if(!manager.isRequestPinAppWidgetSupported()){Toast.makeText(this,"Long-press your home screen, choose Widgets, then Party Crashers",Toast.LENGTH_LONG).show();return;}Intent callback=new Intent(this,WidgetPinnedReceiver.class).putExtra("area",chosenArea).putStringArrayListExtra("interests",interests);int flags=PendingIntent.FLAG_UPDATE_CURRENT|(Build.VERSION.SDK_INT>=31?PendingIntent.FLAG_MUTABLE:0);PendingIntent pending=PendingIntent.getBroadcast(this,(int)System.currentTimeMillis(),callback,flags);manager.requestPinAppWidget(new ComponentName(this,EventsWidget.class),null,pending);}});
  body.addView(text("Updates are periodic and Android may delay them to save battery. Tap Refresh for a newer list. Tap an event to open Party Crashers.",12,false));
  Button open=new Button(this);open.setText("Open Party Crashers");body.addView(open);open.setOnClickListener(v->startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse("https://party-crashers-seven.vercel.app/#profile"))));
 }
 public static void save(Context c,int id,String area,ArrayList<String> interests){EventsWidget.prefs(c,id).edit().putString("area",area).putStringSet("interests",new HashSet<>(interests)).putBoolean("configured",true).remove("cache").apply();EventsWidget.render(c,id);WidgetRefreshService.schedule(c,true);WidgetRefreshService.schedule(c,false);}
}
