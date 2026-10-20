package com.partycrashers.widgets;
import org.junit.Test;
import static org.junit.Assert.*;
import java.util.*;
public class EventMatchTest {
 private final Set<String> interests=new HashSet<>(Arrays.asList("Music"));
 @Test public void subjectsAndAreaMustMatch(){assertTrue(EventMatch.matches("Music",Collections.emptyList(),"VI","physical",interests,"VI"));assertFalse(EventMatch.matches("Business",Collections.emptyList(),"VI","physical",interests,"VI"));assertFalse(EventMatch.matches("Music",Collections.emptyList(),"Ikeja","physical",interests,"VI"));}
 @Test public void onlineIsNotAreaRestricted(){assertTrue(EventMatch.matches("Music",Collections.emptyList(),"Ikeja","online",interests,"VI"));}
 @Test public void noInterestsDoesNotSubscribeToAll(){assertFalse(EventMatch.matches("Music",Collections.emptyList(),"VI","physical",Collections.emptySet(),"Anywhere in Lagos"));}
 @Test public void relatedSubjectsMatch(){assertTrue(EventMatch.matches("Education",Arrays.asList("Music"),"VI","physical",interests,"VI"));}
}
