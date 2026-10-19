export const EVENT_CATEGORIES=['Tech','Startups','Business','Career','Design','Music','Parties','Gaming','Fashion','Art','Sports','Faith','Education','Food','Campus','Community','Comedy','Film','Health','Weddings'] as const;
const rules:Record<string,RegExp>={
 Tech:/\b(tech(?:nology)?|software|developer|coding|artificial intelligence|ai summit|hackathon|cybersecurity)\b/i,
 Startups:/\b(startups?|founders?|pitch competition|venture capital|entrepreneur(?:ship)?)\b/i,
 Business:/\b(business|real estate|trade fair|investment|commerce|networking|finance)\b/i,
 Career:/\b(career|recruitment|job fair|hiring|professional development)\b/i,
 Design:/\b(design|ux|ui|typography|product design|graphic design)\b/i,
 Music:/\b(music|concert|choir|orchestra|jazz|live band|dj|recital)\b/i,
 Parties:/\b(part(?:y|ies)|rave|nightlife|clubbing|club night|listening party)\b/i,
 Gaming:/\b(gaming|esports|video games|game tournament)\b/i,
 Fashion:/\b(fashion|runway|couture|modelling)\b/i,
 Art:/\b(art|arts|theatre|theater|exhibition|gallery|poetry|literary|book club|literature|spoken word)\b/i,
 Sports:/\b(sports?|football|basketball|tennis|marathon|cycling|swimming)\b/i,
 Faith:/\b(worship|gospel|church service|praise|bible|prayer|christian|islamic|mosque|thanksgiving service|carol)\b/i,
 Education:/\b(education|workshop|training|learn|masterclass|course|seminar|school)\b/i,
 Food:/\b(food|abacha|culinary|tasting|brunch|cooking|food festival)\b/i,
 Campus:/\b(campus|university|unilag|lasu|yabatech|lasustech|student union|students? week|matriculation)\b/i,
 Community:/\b(community|volunteer|charity|neighbourhood|neighborhood|trivia|hangout|social club)\b/i,
 Comedy:/\b(comedy|stand.?up|comedian)\b/i,
 Film:/\b(film|cinema|movie|afriff)\b/i,
 Health:/\b(health|wellness|fitness|yoga|mental health|medical|cancer screening|health screening)\b/i,
 Weddings:/\b(wedding|bridal|marriage ceremony)\b/i
};
const schemaCategories:Record<string,string>={MusicEvent:'Music',BusinessEvent:'Business',EducationEvent:'Education',SportsEvent:'Sports',TheaterEvent:'Art',ExhibitionEvent:'Art',ScreeningEvent:'Film',ComedyEvent:'Comedy'};
export function canonicalCategory(value:unknown){return EVENT_CATEGORIES.find(c=>c.toLowerCase()===String(value||'').trim().toLowerCase())||null}
export function classifyEvent(input:{title?:string;description?:string;category?:string;tags?:string[];schemaType?:unknown}){
 const title=input.title||'',description=input.description||'';
 const explicit=canonicalCategory(input.category);
 const types=Array.isArray(input.schemaType)?input.schemaType:[input.schemaType];
 const schema=types.map(t=>schemaCategories[String(t).split('/').pop()||'']).find(Boolean);
 const scored=EVENT_CATEGORIES.map(category=>({category,score:(rules[category].test(title)?8:0)+(rules[category].test(description)?1:0)+(explicit===category?12:0)+(schema===category?10:0)})).sort((a,b)=>b.score-a.score);
 const best=scored[0];const needsReview=best.score<8;
 const category=needsReview?'Other':best.category;
 // Secondary interests require a title, explicit category or schema match; incidental body copy is insufficient.
 const tags=scored.filter(s=>s.category!==category&&s.score>=8).slice(0,3).map(s=>s.category);
 const campus=(input.tags||[]).filter(t=>/^(UNILAG|LASU|YABATECH|LASUSTECH|Pan-Atlantic)$/i.test(t));
 return {category,tags:[...new Set([...tags,...campus])],categoryNeedsReview:needsReview,categoryEvidence:needsReview?'No clear subject; choose a category during review':explicit?'Organizer or reviewer category':schema?'Structured event type':'Event title'};
}
