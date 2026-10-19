-- Organizer monitors collect into private review; they do not auto-publish.
insert into public.pc_sources(id,name,url,adapter,autopublish,enabled,permission_note) values
('web-unilag','University of Lagos','https://unilag.edu.ng/category/unilag-general-news/upcoming-events/page/2/','jsonld',false,true,'Official public events directory; respect robots.txt and review before publication.'),
('web-design-week','Design Week Lagos','https://designweeklagos.com/design-innovation-exhibition/','jsonld',false,true,'Official public exhibition page; respect robots.txt and review before publication.')
on conflict(id) do nothing;
insert into public.pc_discovery_links(url,title,provider,status,source_id)
select url,name,'organizer-research','approved',id from public.pc_sources where id in ('web-unilag','web-design-week') on conflict(url) do nothing;
