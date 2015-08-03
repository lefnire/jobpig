exports.filterJobs = `
SELECT
j.*
,COALESCE(uj.status,'inbox') status
,uj.note
,to_json(array_agg(tags)) tags
,COALESCE(SUM(ut.score),0) score

FROM jobs j

LEFT JOIN (job_tags jt INNER JOIN tags ON tags.id=jt.tag_id) ON j.id=jt.job_id
LEFT JOIN user_tags ut ON ut.tag_id=jt.tag_id AND ut.locked IS NOT TRUE
LEFT JOIN user_jobs uj ON uj.job_id=j.id AND uj.user_id=:user_id

GROUP BY j.id, uj.note, uj.status

HAVING COALESCE(uj.status,'inbox') <> 'hidden' AND COALESCE(SUM(ut.score),0)>-75

ORDER BY score DESC, j.id

LIMIT 50;
`;

exports.filterProspects = ``; //TODO reverse query of above, for clients to find candidates