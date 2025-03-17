import { BlogPosts } from '@/components/posts'

export default function Page() {
  return (
      <section>
        <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
          My Portfolio
        </h1>
        <p className="mb-4">
          {`I'm a girl who majored in computer science. During my 
          university years, I chose to focus on front-end development. 
          I'm immersed in this fascinating and charming field. 
          It's beautiful, interesting, and full of possibilities. 
          I'll continue exploring the front-end world on this path, 
          I believe it's a domain that will never be replaced.`}
        </p>
        <div className="my-8">
          <BlogPosts />
        </div>
      </section>
  )
}

