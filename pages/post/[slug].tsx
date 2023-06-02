import Header from '@/components/Header'
import { client } from '../../sanity/lib/client'
import { Post } from '@/typings'
import { GetStaticProps } from 'next'

interface Props {
    post: Post;
}

function Post({ post }: Props) {
  return (
    <main>
        <Header />
        {post.title}
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