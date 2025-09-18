import { Hono } from 'hono'
import { Context } from 'hono';
import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"
import { sign } from 'hono/jwt';

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();


userRouter.post('/signin' ,async (c : Context) =>{
   try{
    const body = await c.req.json<{ email: string; password: string; name: string }>()

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

    const user = await prisma.user.findUnique({ where: { email: body.email } })

    if (user) return c.json({ message: "User already exists!" }, 400)

//     const salt = await bcrypt.genSalt(10)
//     const hashedPassword = await bcrypt.hash(body.password, salt)

    const newUser = await prisma.user.create({
      data: { email: body.email, name: body.name, password: body.password },
    })

    const token = await sign({id : newUser.id} , c.env.JWT_SECRET)

    return c.json({ message: "User created successfully", token }, 201)
  } catch (err) {
    console.error(err)
    return c.json({ message: "Server error" }, 500)
 }
});
// userRouter.post('/signup' , signUP);

export default userRouter