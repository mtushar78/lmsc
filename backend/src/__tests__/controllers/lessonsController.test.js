/**
 * Unit tests for lessonsController
 */
const lessonsController = require('../../controllers/lessonsController')
const lessonsService = require('../../services/lessonsService')

jest.mock('../../services/lessonsService')

describe('lessonsController', () => {
  let req, res

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {},
    }
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    }
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('should return lessons', async () => {
      const mockLessons = [{ id: 1, title: 'Lesson 1' }]
      lessonsService.getAllLessons.mockResolvedValue(mockLessons)

      await lessonsController.list(req, res)

      expect(res.json).toHaveBeenCalledWith(mockLessons)
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should handle service error', async () => {
      lessonsService.getAllLessons.mockRejectedValue(new Error('DB error'))

      await lessonsController.list(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch lessons' })
    })
  })

  describe('detail', () => {
    it('should return lesson detail', async () => {
      req.params = { id: '1' }
      const mockDetail = { lesson: { id: 1 }, questions: [], tasks: [] }
      lessonsService.getLesson.mockResolvedValue(mockDetail)

      await lessonsController.detail(req, res)

      expect(res.json).toHaveBeenCalledWith(mockDetail)
    })

    it('should handle service error', async () => {
      req.params = { id: '1' }
      lessonsService.getLesson.mockRejectedValue(new Error('Not found'))

      await lessonsController.detail(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('submitQuiz', () => {
    it('should submit quiz successfully', async () => {
      req.body = { lesson_id: 1, student_id: 1, answers: { 1: 'A' } }
      const mockResult = { id: 1, score: 5 }
      lessonsService.submitQuiz.mockResolvedValue(mockResult)

      await lessonsController.submitQuiz(req, res)

      expect(res.json).toHaveBeenCalledWith(mockResult)
    })

    it('should handle duplicate submission error', async () => {
      req.body = { lesson_id: 1, student_id: 1, answers: {} }
      lessonsService.submitQuiz.mockRejectedValue(
        new Error('Student has already submitted quiz for this lesson')
      )

      await lessonsController.submitQuiz(req, res)

      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('already submitted'),
        })
      )
    })

    it('should handle generic submission error', async () => {
      req.body = { lesson_id: 1, student_id: 1, answers: {} }
      lessonsService.submitQuiz.mockRejectedValue(new Error('DB error'))

      await lessonsController.submitQuiz(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('submitTask', () => {
    it('should submit task successfully', async () => {
      req.body = { task_id: 1, student_id: 1, content: 'My task' }
      const mockResult = { id: 1 }
      lessonsService.submitTask.mockResolvedValue(mockResult)

      await lessonsController.submitTask(req, res)

      expect(res.json).toHaveBeenCalledWith(mockResult)
    })

    it('should handle duplicate task submission', async () => {
      req.body = { task_id: 1, student_id: 1, content: 'My task' }
      lessonsService.submitTask.mockRejectedValue(
        new Error('Student has already submitted this task')
      )

      await lessonsController.submitTask(req, res)

      expect(res.status).toHaveBeenCalledWith(409)
    })
  })

  describe('getStatus', () => {
    it('should return submission status', async () => {
      req.params = { id: '1' }
      req.query = { student_id: '1' }
      const mockStatus = { quiz: { id: 1 }, task: { id: 2 } }
      lessonsService.getStatus.mockResolvedValue(mockStatus)

      await lessonsController.status(req, res)

      expect(res.json).toHaveBeenCalledWith(mockStatus)
    })
  })

  describe('recordView', () => {
    it('should record lesson view', async () => {
      req.body = { lesson_id: 1, student_id: 1 }
      lessonsService.recordView.mockResolvedValue(1)

      await lessonsController.view(req, res)

      expect(res.json).toHaveBeenCalledWith({ id: 1 })
    })
  })

  describe('getAttempts', () => {
    it('should return quiz attempts', async () => {
      req.params = { id: '1' }
      const mockAttempts = [{ id: 1, score: 5 }]
      lessonsService.getAttempts.mockResolvedValue(mockAttempts)

      await lessonsController.attempts(req, res)

      expect(res.json).toHaveBeenCalledWith(mockAttempts)
    })
  })

  describe('getSubmissions', () => {
    it('should return task submissions', async () => {
      req.params = { id: '1' }
      const mockSubmissions = [{ id: 1, mark: 8 }]
      lessonsService.getSubmissions.mockResolvedValue(mockSubmissions)

      await lessonsController.submissions(req, res)

      expect(res.json).toHaveBeenCalledWith(mockSubmissions)
    })
  })

  describe('markTask', () => {
    it('should mark task submission', async () => {
      req.body = { submission_id: 1, mark: 8 }
      lessonsService.markTask.mockResolvedValue(1)

      await lessonsController.markTask(req, res)

      expect(res.json).toHaveBeenCalledWith({ changes: 1 })
    })
  })

  describe('markQuiz', () => {
    it('should mark quiz attempt', async () => {
      req.body = { attempt_id: 1, score: 7 }
      lessonsService.markQuiz.mockResolvedValue(1)

      await lessonsController.markQuiz(req, res)

      expect(res.json).toHaveBeenCalledWith({ changes: 1 })
    })
  })
})
