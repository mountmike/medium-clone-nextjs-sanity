import Header from '@/components/Header'
import { client } from '../../sanity/lib/client'
import { Post } from '@/typings'
import { GetStaticProps } from 'next'
import { urlForImage } from '@/sanity/lib/image';
import PortableText from "react-portable-text"

interface Props {
    post: Post;
}

function Post({ post }: Props) {
  return (
    <main>
        <Header />
        <img 
            className='w-full h-60 object-cover' 
            src={urlForImage(post.mainImage).url()!}
            alt="hero"
        />

        <article className='max-w-3xl mx-auto p-5'>
            <h1 className='text-4xl mt-10 mb-3'>{post.title}</h1>
            <h2 className='text-xl font-light text-gray-500 mb-2'>{post.description}</h2>
            <div className='flex items-center space-x-2'>
                <img
                    className='h-10 w-10 rounded-full' 
                    src={urlForImage(post.author.image).url()!} 
                    alt="author" 
                />
                <p className='font-extralight text-sm'>
                    Blog post by <span className='text-green-600'>{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}
                </p>
            </div>

            <div>
                <PortableText 
                    dataset={process.env}
                    projectId={}
                    content={post.body}
                    serializers={}
                />
            </div>

        </article>

       
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
    const query = `*[_type == "post"]{
        _id,
        slug {
            current
        }
    }`
    const posts = await client.fetch(query)

    const paths = posts.map((post: Post) => ({
        params: {
            slug: post.slug.current
        }
    }))

    return {
        paths,
        fallback: 'blocking',
    }
}

export const getStaticProps: GetStaticProps = async ({ params}) => {
    const query = `
    *[_type == "post" && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        slug,
        author -> {
          name,
          image
        },
        description,
        mainImage,
        slug,
        body
      }`

      const post = await client.fetch(query, {
        slug: params?.slug,
      })

      if (!post) {
        return {
            notFound: true
        }
      }

      return {
        props: {
            post
        },
        revalidate: 60 * 60, // affter 60 seconds it will update the old cache
      }
}