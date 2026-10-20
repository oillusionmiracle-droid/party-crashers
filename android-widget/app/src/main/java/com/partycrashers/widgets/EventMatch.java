package com.partycrashers.widgets;
import java.util.*;
public final class EventMatch {
 public static boolean matches(String category,List<String> tags,String eventArea,String format,Set<String> interests,String area){
  if(interests.isEmpty())return false;
  Set<String> topics=new HashSet<>();topics.add(category.trim().toLowerCase(Locale.ROOT));for(String tag:tags)topics.add(tag.trim().toLowerCase(Locale.ROOT));
  boolean hit=false;for(String interest:interests)if(topics.contains(interest.trim().toLowerCase(Locale.ROOT)))hit=true;
  return hit&&(format.equals("online")||area.equals("Anywhere in Lagos")||area.equalsIgnoreCase(eventArea));
 }
}
