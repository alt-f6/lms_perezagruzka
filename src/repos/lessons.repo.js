const db = require("../db");

async function getPublishedLessonById(id) {
  const res = await db.query(
    `
    SELECT id, title, description, video_url, "order", is_published, created_at
    FROM lessons
    WHERE id = $1 AND is_published = true
    LIMIT 1
    `,
    [id]
  );
  return res.rows[0] || null;
}

module.exports = {
  getPublishedLessonById,
};
