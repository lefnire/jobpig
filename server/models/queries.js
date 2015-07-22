exports.filterJobs = `
SELECT
  j.*,
  COALESCE(uj.status,'inbox') status,
  uj.note,
  to_json(array_agg(tags)) AS tags,
  COALESCE(SUM(ut.score),0) AS score

FROM jobs j

LEFT JOIN (job_tags jt INNER JOIN tags ON tags.id=jt.tag_id) ON j.id=jt.job_id
LEFT JOIN user_tags ut USING(tag_id)
LEFT JOIN user_jobs uj ON uj.job_id=j.id AND uj.user_id=:user_id

GROUP BY j.id, j.budget, company, description, j.key, location, source, title, url, j.created_at, j.updated_at, uj.note, uj.status

HAVING COALESCE(uj.status,'inbox') <> 'hidden' AND COALESCE(SUM(ut.score),0)>-20

ORDER BY COALESCE(SUM(ut.score),0) DESC

LIMIT 50;
`;

exports.filterProspects = ``; //TODO reverse query of above, for clients to find candidates