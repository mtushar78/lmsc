require('dotenv').config()
const db = require('./db')

/**
 * Idempotent seeding function
 * Uses findFirst + create pattern since email is not unique
 * Safe to run multiple times
 */
async function seed() {
	console.log('Starting database seed...')

	try {
		// Create students (idempotent using findFirst)
		let alice = await db.student.findFirst({ where: { name: 'Alice Johnson' } })
		if (!alice) {
			alice = await db.student.create({ data: { name: 'Alice Johnson', email: 'alice@example.com' } })
		}

		let bob = await db.student.findFirst({ where: { name: 'Bob Smith' } })
		if (!bob) {
			bob = await db.student.create({ data: { name: 'Bob Smith', email: 'bob@example.com' } })
		}

		let charlie = await db.student.findFirst({ where: { name: 'Charlie Lee' } })
		if (!charlie) {
			charlie = await db.student.create({ data: { name: 'Charlie Lee', email: 'charlie@example.com' } })
		}

		console.log(`✓ ${[alice, bob, charlie].length} students created/verified`)

		// Create teachers (idempotent using findFirst)
		let greenTeacher = await db.teacher.findFirst({ where: { name: 'Mrs Green' } })
		if (!greenTeacher) {
			greenTeacher = await db.teacher.create({ data: { name: 'Mrs Green', email: 'green@example.com' } })
		}

		let brownTeacher = await db.teacher.findFirst({ where: { name: 'Mr Brown' } })
		if (!brownTeacher) {
			brownTeacher = await db.teacher.create({ data: { name: 'Mr Brown', email: 'brown@example.com' } })
		}

		console.log(`✓ ${[greenTeacher, brownTeacher].length} teachers created/verified`)

		// Create lessons (idempotent using findFirst by title)
		let lesson1 = await db.lesson.findFirst({ where: { title: 'Quadratics' } })
		if (!lesson1) {
			lesson1 = await db.lesson.create({
				data: {
					title: 'Quadratics',
					description: 'Introduction to quadratic equations',
					video_url: 'https://www.youtube.com/watch?v=UZTvYYoOrmI',
					teacher_id: greenTeacher.id,
					published_at: new Date(),
				},
			})
		}

		let lesson2 = await db.lesson.findFirst({ where: { title: 'Forces' } })
		if (!lesson2) {
			lesson2 = await db.lesson.create({
				data: {
					title: 'Forces',
					description: 'Newtonian forces overview',
					video_url: 'https://www.youtube.com/watch?v=-7JoUUcvaSI',
					teacher_id: brownTeacher.id,
					published_at: new Date(),
				},
			})
		}

		console.log(`✓ ${[lesson1, lesson2].length} lessons created/verified`)

		// Create quiz questions (check if exist before creating)
		const existingQuestions = await db.quizQuestion.findMany({
			where: { lesson_id: { in: [lesson1.id, lesson2.id] } },
		})

		if (existingQuestions.length === 0) {
			const questions = await db.quizQuestion.createMany({
				data: [
					{
						lesson_id: lesson1.id,
						question_text: 'What is the discriminant?',
						option_a: 'b^2-4ac',
						option_b: 'b^2+4ac',
						option_c: '4ac-b^2',
						option_d: '0',
						correct_option: 'a',
					},
					{
						lesson_id: lesson1.id,
						question_text: 'How many roots can a quadratic have?',
						option_a: '1',
						option_b: '2',
						option_c: '0',
						option_d: '3',
						correct_option: 'b',
					},
					{
						lesson_id: lesson2.id,
						question_text: "What is Newton's second law?",
						option_a: 'F=ma',
						option_b: 'E=mc2',
						option_c: 'a^2+b^2=c^2',
						option_d: 'V=IR',
						correct_option: 'a',
					},
				],
			})
			console.log(`✓ ${questions.count} quiz questions created`)
		} else {
			console.log(`✓ ${existingQuestions.length} quiz questions already exist`)
		}

		// Create lesson tasks (check if exist before creating)
		const existingTasks = await db.lessonTask.findMany({
			where: { lesson_id: { in: [lesson1.id, lesson2.id] } },
		})

		if (existingTasks.length === 0) {
			const tasks = await db.lessonTask.createMany({
				data: [
					{
						lesson_id: lesson1.id,
						task_text: 'Write a one paragraph summary of solving quadratics',
					},
					{
						lesson_id: lesson2.id,
						task_text: "Give an example of Newton's law in everyday life",
					},
				],
			})
			console.log(`✓ ${tasks.count} lesson tasks created`)
		} else {
			console.log(`✓ ${existingTasks.length} lesson tasks already exist`)
		}

		console.log('✅ Database seed completed successfully')
		console.log(`
Seeded Data Summary:
- Students: Alice Johnson, Bob Smith, Charlie Lee
- Teachers: Mrs Green, Mr Brown
- Lessons: Quadratics, Forces
- Quiz Questions: 3 total
- Lesson Tasks: 2 total
		`)
	} catch (error) {
		console.error('❌ Seed failed:', error)
		throw error
	} finally {
		await db.$disconnect()
	}
}

// Run seed
seed().catch((e) => {
	console.error('Fatal error:', e)
	process.exit(1)
})
