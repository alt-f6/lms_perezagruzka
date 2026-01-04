const db = require("../db");

async function createLesson({ title, description, videoUrl, order, isPublished }) {
  const sql = `
    insert into lessons (title, description, video_url, "order", is_published)
    values ($1, $2, $3, $4, $5)
    returning *
  `;
  const res = await db.query(sql, [
    title,
    description || null,
    videoUrl || null,
    Number(order) || 0,
    Boolean(isPublished),
  ]);
  return res.rows[0];
}

async function listLessonsAdmin() {
  const sql = `
    select *
    from lessons
    order by "order" asc, created_at asc
  `;
  const res = await db.query(sql);
  return res.rows;
}

async function setPublished(id, isPublished) {
  const sql = `
    update lessons
    set is_published = $2
    where id = $1
    returning *
  `;
  const res = await db.query(sql, [id, Boolean(isPublished)]);
  return res.rows[0];
}

async function listLessonsForStudent() {
  const sql = `
    select *
    from lessons
    where is_published = true
    order by "order" asc, created_at asc
  `;
  const res = await db.query(sql);
  return res.rows;
}

async function getLessonForStudent(id) {
  const sql = `
    select *
    from lessons
    where id = $1 and is_published = true
  `;
  const res = await db.query(sql, [id]);
  return res.rows[0] || null;
}

module.exports = {
  createLesson,
  listLessonsAdmin,
  setPublished,
  listLessonsForStudent,
  getLessonForStudent,
};
