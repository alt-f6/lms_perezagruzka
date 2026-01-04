const db = require("../db");

async function getPublishedLessonById(id) {
  const res = await db.query(
    `
    SELECT id, title, description, video_url, "order", is_published, content
    FROM lessons
    WHERE id = $1 AND is_published = true
    LIMIT 1
    `,
    [id]
  );
  return res.rows[0] || null;
}

async function getLessonById(id) {
  const res = await db.query(
    `
    SELECT id, title, description, video_url, "order", is_published, content
    FROM lessons
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );
  return res.rows[0] || null;
}

async function updateLessonContent(id, content) {
  await db.query(
    `
    UPDATE lessons
    SET content = $2
    WHERE id = $1
    `,
    [id, content]
  );
}

async function updateLessonVideoUrl(id, videoUrl) {
  await db.query(
    `
    UPDATE lessons
    SET video_url = $2
    WHERE id = $1
    `,
    [id, videoUrl || null]
  );
}

async function deleteLessonById(id) {
  await db.query(
    `DELETE FROM lessons WHERE id = $1`,
    [id]
  );
}

module.exports = {
  getPublishedLessonById,
  getLessonById,
  updateLessonContent,
  updateLessonVideoUrl,
  deleteLessonById,
};