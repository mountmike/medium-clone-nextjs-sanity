import Header from '@/components/Header'
import { client } from '../../sanity/lib/client'
import { Post } from '@/typings'
import { GetStaticProps } from 'next'
import { urlForImage } from '@/sanity/lib/image'
import PortableText from "react-portable-text"
import { useForm, SubmitHandler } from 'react-hook-form'
import { log } from 'console'
import { useState } from 'react'

interface Props {
    post: Post;
}

interface IFormInput {
    _id: string;
    name: string;
    email: string;
    comment: string;
}

function Post({ post }: Props) {
    const [submited, setSubmited] = useState(false)

    const { 
        register, 
        handleSubmit, 
        formState: { errors },
    } = useForm<IFormInput>()

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        fetch('/api/createComment', {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(() => {
            console.log(data);
            setSubmited(true)
            
        }).catch((err) => {
            console.log(err);
            setSubmited(false)
        })
    }

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
                    dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
                    projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
                    content={post.body}
                    serializers={{
                        h1: (props: any) => (
                            <h1 className="text-2xl font-bold my-5" {... props} />
                        ),
                        h2: (props: any) => (
                            <h2 className="text-xl font-bold my-5" {... props} />
                        ),
                        li: ({ children }: any) => (
                            <li className="ml-4 list-disc">{children}</li>
                        ),
                        link: ({ href, children }: any) => (
                            <a href={href} className='text-blue-500 hover:underline'>
                                { children }
                            </a>
                        ),
                    }}
                />
            </div>

        </article>

        <hr className='max-w-lg my-5 mx-auto border-yellow-500'/>
        
       {submited ? (
        <div className='flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto'>
            <h3 className='text-3xl font-bold'>Thankyou for Submitted</h3>
            <p>Once its has been approved it will appear below</p>
        </div>
       ) :
       <form 
       className='flex flex-col p-5 max-w-2xl mb-10 mx-auto'
       onSubmit={handleSubmit(onSubmit)}
   >
       <h3 className='text-3xl my-5'>Leave a comment?</h3>

       <input 
           {...register("_id")}
           type="hidden" 
           name='_id'
           value={post._id}
       />

       <label className='block mb-5'>
           <span className='text-gray-700'>Name</span>
           <input
               {...register("name", { required: true })}
               className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500' 
               type="text" 
               placeholder='Mike Snow' 
           />
       </label>
       <label className='block mb-5'>
           <span className='text-gray-700'>Email</span>
           <input 
           {...register("email", { required: true })}
           className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500' 
           type="text" 
           placeholder='time@jestyco.com' 
       />
       </label>
       <label className='block mb-5'>
           <span className='text-gray-700'>Comment</span>
           <textarea
               {...register("comment", { required: true })} 
               className='shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500' 
               placeholder='Mike Snow' 
               rows={8} />
       </label>

       {/* errors will return when field validation fails*/}

       <div className='flex flex-col p-5'>
           {errors.name && (
               <span className='text-red-500'>The name field is required</span>
           )}
            {errors.comment && (
               <span className='text-red-500'>The comment field is required</span>
           )}
            {errors.email && (
               <span className='text-red-500'>The email field is required</span>
           )}
       </div>

       <input 
           type="submit" 
           className='shaddow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline text-black font-bold py-2 px-3 rounded cursor-pointer' 
       />

   </form>}

       
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