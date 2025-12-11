/**
 * Data mappers for transforming domain models to DTOs
 * Ensures consistent API response formats and hides internal fields
 */

function mapLesson(lesson) {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    video_url: lesson.video_url,
    teacher_id: lesson.teacher_id,
    teacher_name: lesson.teacher?.name || null,
    published_at: lesson.published_at,
    viewed_count: lesson._count?.lesson_views || 0,
    quiz_count: lesson._count?.quiz_attempts || 0,
  }
}

function mapLessonDetail(lesson, questions, tasks) {
  return {
    lesson: mapLesson(lesson),
    questions: questions.map(q => ({
      id: q.id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
    })),
    tasks: tasks.map(t => ({
      id: t.id,
      task_text: t.task_text,
    })),
  }
}

function mapQuizAttempt(attempt) {
  return {
    id: attempt.id,
    lesson_id: attempt.lesson_id,
    student_id: attempt.student_id,
    student_name: attempt.student?.name || null,
    submitted_at: attempt.submitted_at,
    score: attempt.score,
    answers: attempt.answers?.map(ans => ({
      id: ans.id,
      question_id: ans.question_id,
      answer: ans.answer,
      question_text: ans.question?.question_text,
      option_a: ans.question?.option_a,
      option_b: ans.question?.option_b,
      option_c: ans.question?.option_c,
      option_d: ans.question?.option_d,
      correct_option: ans.question?.correct_option,
    })) || [],
  }
}

function mapTaskSubmission(submission) {
  return {
    id: submission.id,
    task_id: submission.task_id,
    student_id: submission.student_id,
    student_name: submission.student?.name || null,
    content: submission.content,
    submitted_at: submission.submitted_at,
    mark: submission.mark,
  }
}

function mapStudent(student) {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
  }
}

function mapTeacher(teacher) {
  return {
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
  }
}

module.exports = {
  mapLesson,
  mapLessonDetail,
  mapQuizAttempt,
  mapTaskSubmission,
  mapStudent,
  mapTeacher,
}
