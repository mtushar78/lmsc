/**
 * Unit tests for lessonsService
 * Tests business logic without database access using mocked Prisma client
 */
const lessonsService = require('../../services/lessonsService')
const { ValidationError } = require('../../domain/validators')

// Mock the db module
jest.mock('../../../db', () => ({
  lesson: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  quizQuestion: {
    findMany: jest.fn(),
  },
  lessonTask: {
    findMany: jest.fn(),
  },
  quizAttempt: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  quizAnswer: {
    createMany: jest.fn(),
  },
  taskSubmission: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  lessonView: {
    create: jest.fn(),
  },
}))

const db = require('../../../db')

describe('lessonsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllLessons', () => {
    it('should return mapped lessons with metadata', async () => {
      const mockLessons = [
        {
          id: 1,
          title: 'Lesson 1',
          description: 'Desc 1',
          video_url: 'https://example.com/video1.mp4',
          teacher_id: 1,
          published_at: new Date(),
          teacher: { id: 1, name: 'Teacher 1' },
          _count: { lesson_views: 5, quiz_attempts: 3 },
        },
      ]

      db.lesson.findMany.mockResolvedValue(mockLessons)

      const result = await lessonsService.getAllLessons()

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 1,
        title: 'Lesson 1',
        teacher_name: 'Teacher 1',
        viewed_count: 5,
        quiz_count: 3,
      })
    })

    it('should handle lessons without a teacher', async () => {
      const mockLessons = [
        {
          id: 1,
          title: 'Lesson 1',
          description: 'Desc 1',
          video_url: 'https://example.com/video1.mp4',
          teacher_id: null,
          published_at: new Date(),
          teacher: null,
          _count: { lesson_views: 0, quiz_attempts: 0 },
        },
      ]

      db.lesson.findMany.mockResolvedValue(mockLessons)

      const result = await lessonsService.getAllLessons()

      expect(result[0].teacher_name).toBeNull()
    })
  })

  describe('getLesson', () => {
    it('should return lesson with questions and tasks', async () => {
      const mockLesson = {
        id: 1,
        title: 'Lesson 1',
        description: 'Desc 1',
        video_url: 'https://example.com/video1.mp4',
        teacher_id: 1,
        teacher: { id: 1, name: 'Teacher 1' },
      }

      const mockQuestions = [
        {
          id: 1,
          question_text: 'Q1',
          option_a: 'A',
          option_b: 'B',
          correct_option: 'A',
        },
      ]

      const mockTasks = [
        {
          id: 1,
          task_text: 'Task 1',
        },
      ]

      db.lesson.findUnique.mockResolvedValue(mockLesson)
      db.quizQuestion.findMany.mockResolvedValue(mockQuestions)
      db.lessonTask.findMany.mockResolvedValue(mockTasks)

      const result = await lessonsService.getLesson(1)

      expect(result.lesson).toBeDefined()
      expect(result.questions).toHaveLength(1)
      expect(result.tasks).toHaveLength(1)
    })

    it('should handle missing lesson', async () => {
      db.lesson.findUnique.mockResolvedValue(null)
      db.quizQuestion.findMany.mockResolvedValue([])
      db.lessonTask.findMany.mockResolvedValue([])

      const result = await lessonsService.getLesson(999)

      expect(result.lesson).toBeNull()
    })
  })

  describe('submitQuiz', () => {
    it('should calculate score correctly', async () => {
      const mockQuestions = [
        { id: 1, correct_option: 'A' },
        { id: 2, correct_option: 'B' },
        { id: 3, correct_option: 'C' },
      ]

      const mockAttempt = {
        id: 1,
        lesson_id: 1,
        student_id: 1,
        submitted_at: new Date(),
        score: 2,
      }

      db.quizAttempt.findFirst.mockResolvedValue(null)
      db.quizQuestion.findMany.mockResolvedValue(mockQuestions)
      db.quizAttempt.create.mockResolvedValue(mockAttempt)
      db.quizAnswer.createMany.mockResolvedValue({ count: 3 })

      const answers = {
        '1': 'A', // correct
        '2': 'C', // wrong
        '3': 'C', // correct
      }

      const result = await lessonsService.submitQuiz(1, 1, answers)

      expect(result.score).toBe(2)
      expect(db.quizAnswer.createMany).toHaveBeenCalled()
    })

    it('should prevent duplicate submission', async () => {
      const existingAttempt = { id: 1, lesson_id: 1, student_id: 1 }

      db.quizAttempt.findFirst.mockResolvedValue(existingAttempt)

      await expect(lessonsService.submitQuiz(1, 1, {})).rejects.toThrow(
        'Student has already submitted quiz for this lesson'
      )
    })

    it('should handle empty answers', async () => {
      const mockQuestions = [
        { id: 1, correct_option: 'A' },
      ]

      const mockAttempt = {
        id: 1,
        score: 0,
      }

      db.quizAttempt.findFirst.mockResolvedValue(null)
      db.quizQuestion.findMany.mockResolvedValue(mockQuestions)
      db.quizAttempt.create.mockResolvedValue(mockAttempt)
      db.quizAnswer.createMany.mockResolvedValue({ count: 1 })

      const result = await lessonsService.submitQuiz(1, 1, {})

      expect(result.score).toBe(0)
    })
  })

  describe('submitTask', () => {
    it('should create task submission', async () => {
      const mockSubmission = {
        id: 1,
        task_id: 1,
        student_id: 1,
        submitted_at: new Date(),
        content: 'Task response',
      }

      db.taskSubmission.findFirst.mockResolvedValue(null)
      db.taskSubmission.create.mockResolvedValue(mockSubmission)

      const result = await lessonsService.submitTask(1, 1, 'Task response')

      expect(result.id).toBe(1)
      expect(db.taskSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          task_id: 1,
          student_id: 1,
          content: 'Task response',
        }),
      })
    })

    it('should prevent duplicate task submission', async () => {
      const existingSubmission = { id: 1, task_id: 1, student_id: 1 }

      db.taskSubmission.findFirst.mockResolvedValue(existingSubmission)

      await expect(lessonsService.submitTask(1, 1, 'content')).rejects.toThrow(
        'Student has already submitted this task'
      )
    })
  })

  describe('recordView', () => {
    it('should record lesson view', async () => {
      const mockView = {
        id: 1,
        lesson_id: 1,
        student_id: 1,
        viewed_at: new Date(),
      }

      db.lessonView.create.mockResolvedValue(mockView)

      const result = await lessonsService.recordView(1, 1)

      expect(result).toBe(1)
      expect(db.lessonView.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          lesson_id: 1,
          student_id: 1,
        }),
      })
    })
  })

  describe('getStatus', () => {
    it('should return quiz and task status', async () => {
      const mockQuiz = { id: 1, lesson_id: 1, student_id: 1, score: 5 }
      const mockTask = { id: 1, task_id: 1, student_id: 1, mark: 8 }

      db.quizAttempt.findFirst.mockResolvedValue(mockQuiz)
      db.taskSubmission.findFirst.mockResolvedValue(mockTask)

      const result = await lessonsService.getStatus(1, 1)

      expect(result.quiz).toBeDefined()
      expect(result.task).toBeDefined()
    })

    it('should return null for missing submissions', async () => {
      db.quizAttempt.findFirst.mockResolvedValue(null)
      db.taskSubmission.findFirst.mockResolvedValue(null)

      const result = await lessonsService.getStatus(1, 1)

      expect(result.quiz).toBeNull()
      expect(result.task).toBeNull()
    })
  })

  describe('markTask', () => {
    it('should update task mark', async () => {
      const mockSubmission = {
        id: 1,
        mark: 8,
      }

      db.taskSubmission.update.mockResolvedValue(mockSubmission)

      const result = await lessonsService.markTask(1, 8)

      expect(result).toBe(1)
      expect(db.taskSubmission.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { mark: 8 },
      })
    })
  })

  describe('markQuiz', () => {
    it('should update quiz score', async () => {
      const mockAttempt = {
        id: 1,
        score: 7,
      }

      db.quizAttempt.update.mockResolvedValue(mockAttempt)

      const result = await lessonsService.markQuiz(1, 7)

      expect(result).toBe(1)
      expect(db.quizAttempt.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { score: 7 },
      })
    })
  })
})
