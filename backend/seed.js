require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seed(){
	await prisma.quizAnswer.deleteMany()
	await prisma.quizAttempt.deleteMany()
	await prisma.quizQuestion.deleteMany()
	await prisma.taskSubmission.deleteMany()
	await prisma.lessonTask.deleteMany()
	await prisma.lessonView.deleteMany()
	await prisma.lesson.deleteMany()
	await prisma.student.deleteMany()
	await prisma.teacher.deleteMany()

	const alice = await prisma.student.create({data:{name:'Alice Johnson', email:'alice@example.com'}})
	const bob = await prisma.student.create({data:{name:'Bob Smith', email:'bob@example.com'}})
	const charlie = await prisma.student.create({data:{name:'Charlie Lee', email:'charlie@example.com'}})

	const g = await prisma.teacher.create({data:{name:'Mrs Green', email:'green@example.com'}})
	const b = await prisma.teacher.create({data:{name:'Mr Brown', email:'brown@example.com'}})

	const lesson1 = await prisma.lesson.create({data:{title:'Quadratics', description:'Introduction to quadratic equations', video_url:'https://www.youtube.com/watch?v=UZTvYYoOrmI', teacher_id: g.id, published_at: new Date()}})
	const lesson2 = await prisma.lesson.create({data:{title:'Forces', description:'Newtonian forces overview', video_url:'https://www.youtube.com/watch?v=-7JoUUcvaSI', teacher_id: b.id, published_at: new Date()}})

	await prisma.quizQuestion.createMany({data:[
		{lesson_id: lesson1.id, question_text: 'What is the discriminant?', option_a: 'b^2-4ac', option_b: 'b^2+4ac', option_c: '4ac-b^2', option_d: '0', correct_option: 'a'},
		{lesson_id: lesson1.id, question_text: 'How many roots can a quadratic have?', option_a: '1', option_b: '2', option_c: '0', option_d: '3', correct_option: 'b'},
		{lesson_id: lesson2.id, question_text: "What is Newton's second law?", option_a: 'F=ma', option_b: 'E=mc2', option_c: 'a^2+b^2=c^2', option_d: 'V=IR', correct_option: 'a'}
	]})

	await prisma.lessonTask.createMany({data:[
		{lesson_id: lesson1.id, task_text: 'Write a one paragraph summary of solving quadratics'},
		{lesson_id: lesson2.id, task_text: "Give an example of Newton's law in everyday life"}
	]})

	console.log('Seed complete')
	await prisma.$disconnect()
}

seed().catch(e=>{
	console.error(e)
	prisma.$disconnect()
})
