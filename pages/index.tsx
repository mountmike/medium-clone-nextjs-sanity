import Image from 'next/image'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import Header from '@/components/Header'
import { client } from '../sanity/lib/client'
import { Post } from '@/typings'
import Link from 'next/link'
import { urlForImage } from '@/sanity/lib/image'

const inter = Inter({ subsets: ['latin'] })

interface Props {
  posts: [Post]
}


export default function Home({ posts }: Props) {
  console.log(posts);
  
  return (
    <main className='max-w-7xl mx-auto'>
      <Head>
        <title>Medium Blog Clone</title>
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
      </Head>

      <Header />

      <div className='flex justify-between items-center bg-yellow-400 border-y border-black py-10 lg:py-0'>
        <div className='px-10 space-y-5'>
          <h1 className='text-6xl max-w-xl font-serif'><span className='underline decoration-black decoration-4'>Medium</span> is a place to write, read and connect</h1>
          <h2>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sed, eveniet. Aperiam quos incidunt, illum alias ducimus accusantium cum omnis veritatis praesentium consectetur saepe, necessitatibus vero doloribus maiores, ut in similique.</h2>
        </div>
        <img className='hidden md:inline-flex h-32 lg:h-full' src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png" alt='Medium Logo' />
      </div>

      { /* posts */ }
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-6 p-2 lg:p-6'>
        {posts.map(post => (
          <Link key={post._id} href={`/post/${post.slug.current}`}>
            <article className='group cursor-pointer rounded-lg overflow-hidden'>
              <img 
                className='h-60 w-full object-cover group-hover:scale-105 transition-transform duration-200'
                src={urlForImage(post.mainImage).url()} 
                alt="Article photo" 
              />
              <div className='flex justify-between p-5 bg-orange-100'>
                <div>
                  <p>{post.title}</p>
                  <p>{post.description} by {post.author.name}</p>
                </div>
                <div>
                  <img 
                    className='h-12 w-12 rounded-full'
                    src={urlForImage(post.author.image).url()} 
                    alt="Author photo" 
                  />
                </div>
              </div>
            </article>

          </Link>
        ))}  
      </div>

    </main>
  )
}

export const getServerSideProps = async () => {
  const query = `*[_type == "post"]{
    _id,
    title,
    slug,
    author -> {
      name,
      image
    },
    mainImage
  }`

  const posts = await client.fetch(query)

  return {
    props: {
      posts,
    }
  }
}
