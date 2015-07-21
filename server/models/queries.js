
exports.filterJobs = `
SELECT j.*,
  COALESCE(uj.status,'inbox') status,
  uj.note,
  --  jt.t AS tags
to_json(array_agg(tags)) as tags

FROM (
  -- SELECT jobs.* FROM jobs LEFT JOIN job_tags ON jobs.id=job_tags.job_id
SELECT jobs.* FROM jobs

EXCEPT ( -- exclude bad jobs
SELECT jobs.* FROM jobs
INNER JOIN job_tags ON job_tags.job_id=jobs.id
INNER JOIN user_tags ON user_tags.tag_id=job_tags.tag_id AND user_tags.user_id=:user_id AND user_tags.score<0
)
) j

LEFT JOIN (job_tags jt INNER JOIN tags ON tags.id=jt.tag_id) ON j.id=jt.job_id
/*LEFT JOIN (
 SELECT job_id, tag_id, to_json(array_agg(tags)) t
 FROM job_tags
 INNER JOIN tags ON tags.id=job_tags.tag_id
 GROUP BY job_id,tag_id
 ) jt ON j.id=jt.job_id*/

LEFT JOIN user_jobs uj ON uj.job_id=j.id AND uj.user_id=:user_id
/*LEFT JOIN (
 SELECT job_id, status
 FROM user_jobs
 WHERE user_id=:user_id
 GROUP BY job_id,user_id,status
 ) uj ON uj.job_id=j.id*/

-- really necessary to group by all fields? getting error otherwise
GROUP BY j.id, j.budget, company, description, j.key, location, source, title, url, j.created_at, j.updated_at, uj.note, status
HAVING uj.status <> 'hidden' OR uj.status IS NULL
ORDER BY j.id
LIMIT 50
`;

exports.filterProspects = ``; //TODO reverse query of above, for clients to find candidates