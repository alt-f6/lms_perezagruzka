DELETE FROM assignments a
USING assignments b
WHERE a.id > b.id
  AND a.student_id = b.student_id
  AND a.lesson_id = b.lesson_id;
