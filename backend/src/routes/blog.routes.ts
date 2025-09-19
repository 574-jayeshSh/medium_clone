import { Hono } from 'hono'
import { Context } from 'hono'



const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
}>()

blogRouter.use('/blog/*' , async(c,next) => {

})

blogRouter.post('/blog' , async(c : Context) => {
    const blog = await c.req.json<{title : string ; content : string ; published : boolean; author : string}>();
});
// blogRouter.put('/blog' , blogUpdate);
// blogRouter.get('/blog' , blogGet);
// blogRouter.get('/blog/blog' , blogBulkGet);

export default blogRouter