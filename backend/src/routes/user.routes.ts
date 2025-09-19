import { Hono } from 'hono'
import { Context } from 'hono'
import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'
import prisam from "../lib/getPrisma"
// import the plain Prisma client

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
}>()

// Sign-up route
userRouter.post('/signin', async (c: Context) => {
  try {
    const body = await c.req.json<{ email: string; password: string; name: string }>()

    // Check if user already exists
    const existingUser = await prisam.user.findUnique({ where: { email: body.email } })
    if (existingUser) return c.json({ message: 'User already exists!' }, 409)

    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Create new user
    const newUser = await prisam.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
      },
    })

    // Sign JWT
    const token = await sign(
      { id: newUser.id, email: newUser.email },
      c.env.JWT_SECRET
    )

    return c.json({ message: 'User created successfully', token }, 201)
  } catch (err) {
    console.error(err)
    return c.json({ message: 'Server error' }, 500)
  }
})

// Login route
userRouter.post('/signup', async (c: Context) => {
  try {
    const body = await c.req.json<{ email: string; password: string }>()

    const user = await prisam.user.findUnique({ where: { email: body.email } })
    if (!user) return c.json({ message: 'Invalid credentials' }, 401)

    const passwordMatch = await bcrypt.compare(body.password, user.password)
    if (!passwordMatch) return c.json({ message: 'Invalid credentials' }, 401)

    const token = await sign(
      { id: user.id, email: user.email },
      c.env.JWT_SECRET
    )

    return c.json({ message: 'Login successful', token }, 200)
  } catch (err) {
    console.error(err)
    return c.json({ message: 'Server error' }, 500)
  }
})

export default userRouter
