/**
 * Unit tests for validators domain layer
 */
const {
  validateLessonInput,
  validateQuizAnswer,
  validateTaskSubmission,
  validateStudentId,
  validateLessonId,
  validateQuizMark,
  ValidationError,
} = require('../../domain/validators')

describe('validators', () => {
  describe('validateLessonInput', () => {
    it('should validate correct lesson input', () => {
      const lesson = {
        title: 'Valid Lesson',
        description: 'A valid description',
        video_url: 'https://example.com/video.mp4',
        teacher_id: 1,
      }

      expect(() => validateLessonInput(lesson)).not.toThrow()
    })

    it('should throw error for missing title', () => {
      const lesson = {
        description: 'Desc',
      }

      expect(() => validateLessonInput(lesson)).toThrow(ValidationError)
    })

    it('should throw error for empty title', () => {
      const lesson = {
        title: '   ',
        description: 'Desc',
      }

      expect(() => validateLessonInput(lesson)).toThrow(ValidationError)
    })

    it('should throw error for title exceeding max length', () => {
      const lesson = {
        title: 'A'.repeat(256),
      }

      expect(() => validateLessonInput(lesson)).toThrow(ValidationError)
    })

    it('should throw error for invalid video URL', () => {
      const lesson = {
        title: 'Lesson',
        video_url: 'not a url',
      }

      expect(() => validateLessonInput(lesson)).toThrow(ValidationError)
    })

    it('should throw error for invalid teacher_id', () => {
      const lesson = {
        title: 'Lesson',
        teacher_id: -1,
      }

      expect(() => validateLessonInput(lesson)).toThrow(ValidationError)
    })
  })

  describe('validateQuizAnswer', () => {
    it('should validate correct quiz answers', () => {
      const answers = { 1: 'A', 2: 'B' }
      const questionIds = [1, 2, 3]

      expect(() => validateQuizAnswer(answers, questionIds)).not.toThrow()
    })

    it('should throw error for non-object answers', () => {
      expect(() => validateQuizAnswer('not an object', [1, 2])).toThrow(ValidationError)
    })

    it('should throw error for invalid question IDs', () => {
      const answers = { 1: 'A', 5: 'B' }
      const questionIds = [1, 2, 3]

      expect(() => validateQuizAnswer(answers, questionIds)).toThrow(ValidationError)
    })
  })

  describe('validateTaskSubmission', () => {
    it('should validate correct task submission', () => {
      const content = 'This is my task submission'

      expect(() => validateTaskSubmission(content)).not.toThrow()
    })

    it('should throw error for empty submission', () => {
      expect(() => validateTaskSubmission('')).toThrow(ValidationError)
    })

    it('should throw error for non-string content', () => {
      expect(() => validateTaskSubmission(123)).toThrow(ValidationError)
    })

    it('should throw error for content exceeding max length', () => {
      const content = 'A'.repeat(10001)

      expect(() => validateTaskSubmission(content)).toThrow(ValidationError)
    })
  })

  describe('validateStudentId', () => {
    it('should validate correct student ID', () => {
      expect(() => validateStudentId(1)).not.toThrow()
    })

    it('should throw error for negative ID', () => {
      expect(() => validateStudentId(-1)).toThrow(ValidationError)
    })

    it('should throw error for non-integer ID', () => {
      expect(() => validateStudentId(1.5)).toThrow(ValidationError)
    })

    it('should throw error for zero ID', () => {
      expect(() => validateStudentId(0)).toThrow(ValidationError)
    })
  })

  describe('validateLessonId', () => {
    it('should validate correct lesson ID', () => {
      expect(() => validateLessonId(42)).not.toThrow()
    })

    it('should throw error for invalid ID', () => {
      expect(() => validateLessonId(-5)).toThrow(ValidationError)
    })
  })

  describe('validateQuizMark', () => {
    it('should validate correct mark', () => {
      expect(() => validateQuizMark(5, 10)).not.toThrow()
    })

    it('should throw error for negative mark', () => {
      expect(() => validateQuizMark(-1, 10)).toThrow(ValidationError)
    })

    it('should throw error for mark exceeding total', () => {
      expect(() => validateQuizMark(11, 10)).toThrow(ValidationError)
    })

    it('should throw error for non-integer mark', () => {
      expect(() => validateQuizMark(5.5, 10)).toThrow(ValidationError)
    })
  })
})
