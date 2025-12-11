/**
 * Integration tests for API routes
 * Tests the full request-response cycle with mocked database
 */
const request = require('supertest')
const app = require('../../app')
const lessonsService = require('../../services/lessonsService')

jest.mock('../../services/lessonsService')

describe('API Routes - Lessons', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/lessons', () => {
    it('should return 200 with lessons', async () => {
      const mockLessons = [
        {
          id: 1,
          title: 'Lesson 1',
          description: 'Desc 1',
          video_url: 'https://example.com/video1.mp4',
          teacher_name: 'Teacher 1',
        },
      ]
      lessonsService.getAllLessons.mockResolvedValue(mockLessons)

      const response = await request(app).get('/api/lessons')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockLessons)
    })

    it('should return 500 on service error', async () => {
      lessonsService.getAllLessons.mockRejectedValue(new Error('DB error'))

      const response = await request(app).get('/api/lessons')

      expect(response.status).toBe(500)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/lessons/:id', () => {
    it('should return 200 with lesson detail', async () => {
      const mockDetail = {
        lesson: { id: 1, title: 'Lesson 1' },
        questions: [{ id: 1, question_text: 'Q1' }],
        tasks: [{ id: 1, task_text: 'Task 1' }],
      }
      lessonsService.getLesson.mockResolvedValue(mockDetail)

      const response = await request(app).get('/api/lessons/1')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockDetail)
    })
  })

  describe('GET /api/lessons/:id/status', () => {
    it('should return student submission status', async () => {
      const mockStatus = {
        quiz: { id: 1, score: 5 },
        task: { id: 1, mark: 8 },
      }
      lessonsService.getStatus.mockResolvedValue(mockStatus)

      const response = await request(app)
        .get('/api/lessons/1/status')
        .query({ student_id: 1 })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockStatus)
    })
  })

  describe('POST /api/lessons/view', () => {
    it('should record lesson view', async () => {
      lessonsService.recordView.mockResolvedValue(1)

      const response = await request(app)
        .post('/api/lessons/view')
        .send({ lesson_id: 1, student_id: 1 })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ id: 1 })
    })
  })

  describe('POST /api/lessons/quiz/submit', () => {
    it('should submit quiz successfully', async () => {
      const mockResult = { id: 1, score: 5 }
      lessonsService.submitQuiz.mockResolvedValue(mockResult)

      const response = await request(app)
        .post('/api/lessons/quiz/submit')
        .send({
          lesson_id: 1,
          student_id: 1,
          answers: { 1: 'A', 2: 'B' },
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockResult)
    })

    it('should return 409 for duplicate submission', async () => {
      lessonsService.submitQuiz.mockRejectedValue(
        new Error('Student has already submitted quiz for this lesson')
      )

      const response = await request(app)
        .post('/api/lessons/quiz/submit')
        .send({
          lesson_id: 1,
          student_id: 1,
          answers: { 1: 'A' },
        })

      expect(response.status).toBe(409)
      expect(response.body.error).toContain('already submitted')
    })
  })

  describe('POST /api/lessons/task/submit', () => {
    it('should submit task successfully', async () => {
      const mockResult = { id: 1 }
      lessonsService.submitTask.mockResolvedValue(mockResult)

      const response = await request(app)
        .post('/api/lessons/task/submit')
        .send({
          task_id: 1,
          student_id: 1,
          content: 'Task response',
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockResult)
    })

    it('should return 409 for duplicate task submission', async () => {
      lessonsService.submitTask.mockRejectedValue(
        new Error('Student has already submitted this task')
      )

      const response = await request(app)
        .post('/api/lessons/task/submit')
        .send({
          task_id: 1,
          student_id: 1,
          content: 'content',
        })

      expect(response.status).toBe(409)
    })
  })

  describe('GET /api/lessons/:id/attempts', () => {
    it('should return quiz attempts for lesson', async () => {
      const mockAttempts = [
        {
          id: 1,
          student_name: 'Student 1',
          score: 5,
          answers: [],
        },
      ]
      lessonsService.getAttempts.mockResolvedValue(mockAttempts)

      const response = await request(app).get('/api/lessons/1/attempts')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockAttempts)
    })
  })

  describe('GET /api/lessons/:id/submissions', () => {
    it('should return task submissions for lesson', async () => {
      const mockSubmissions = [
        {
          id: 1,
          student_name: 'Student 1',
          mark: 8,
        },
      ]
      lessonsService.getSubmissions.mockResolvedValue(mockSubmissions)

      const response = await request(app).get('/api/lessons/1/submissions')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockSubmissions)
    })
  })

  describe('POST /api/lessons/task/mark', () => {
    it('should mark task submission', async () => {
      lessonsService.markTask.mockResolvedValue(1)

      const response = await request(app)
        .post('/api/lessons/task/mark')
        .send({
          submission_id: 1,
          mark: 8,
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ changes: 1 })
    })
  })

  describe('POST /api/lessons/quiz/mark', () => {
    it('should mark quiz attempt', async () => {
      lessonsService.markQuiz.mockResolvedValue(1)

      const response = await request(app)
        .post('/api/lessons/quiz/mark')
        .send({
          attempt_id: 1,
          score: 7,
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ changes: 1 })
    })
  })
})

describe('Health Check', () => {
  it('should return 200 with health status', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('ok', true)
    expect(response.body).toHaveProperty('uptime')
  })
})
