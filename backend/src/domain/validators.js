/**
 * Domain validators for business logic
 * Separate from HTTP validation to ensure consistency across APIs
 */

class ValidationError extends Error {
  constructor(message, fieldErrors = {}) {
    super(message)
    this.name = 'ValidationError'
    this.fieldErrors = fieldErrors
  }
}

function validateLessonInput(lesson) {
  const errors = {}

  if (!lesson.title || typeof lesson.title !== 'string' || lesson.title.trim().length === 0) {
    errors.title = 'Title is required and must be a non-empty string'
  }

  if (lesson.title && lesson.title.length > 255) {
    errors.title = 'Title must not exceed 255 characters'
  }

  if (lesson.description && lesson.description.length > 2000) {
    errors.description = 'Description must not exceed 2000 characters'
  }

  if (lesson.video_url && !isValidUrl(lesson.video_url)) {
    errors.video_url = 'Video URL must be a valid URL'
  }

  if (lesson.teacher_id !== undefined && (!Number.isInteger(lesson.teacher_id) || lesson.teacher_id < 1)) {
    errors.teacher_id = 'Teacher ID must be a positive integer'
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Lesson validation failed', errors)
  }
}

function validateQuizAnswer(answers, questionIds) {
  if (!answers || typeof answers !== 'object') {
    throw new ValidationError('Answers must be an object')
  }

  // Check that all answered question IDs exist in the lesson
  const answeredIds = Object.keys(answers).map(Number)
  const invalidIds = answeredIds.filter(id => !questionIds.includes(id))
  
  if (invalidIds.length > 0) {
    throw new ValidationError(`Invalid question IDs: ${invalidIds.join(', ')}`)
  }
}

function validateTaskSubmission(content) {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ValidationError('Task submission content is required')
  }

  if (content.length > 10000) {
    throw new ValidationError('Task submission content must not exceed 10000 characters')
  }
}

function validateStudentId(studentId) {
  if (!Number.isInteger(studentId) || studentId < 1) {
    throw new ValidationError('Student ID must be a positive integer', { student_id: 'Invalid student ID' })
  }
}

function validateLessonId(lessonId) {
  if (!Number.isInteger(lessonId) || lessonId < 1) {
    throw new ValidationError('Lesson ID must be a positive integer', { lesson_id: 'Invalid lesson ID' })
  }
}

function validateQuizMark(score, totalQuestions) {
  if (!Number.isInteger(score) || score < 0 || score > totalQuestions) {
    throw new ValidationError('Mark must be an integer between 0 and ' + totalQuestions)
  }
}

function isValidUrl(urlString) {
  try {
    new URL(urlString)
    return true
  } catch (_) {
    return false
  }
}

module.exports = {
  validateLessonInput,
  validateQuizAnswer,
  validateTaskSubmission,
  validateStudentId,
  validateLessonId,
  validateQuizMark,
  ValidationError,
}
