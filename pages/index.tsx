import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Header from '../components/Header'
import { Post } from '../typying'
import { sanityClient, urlFor } from './../sanity'


interface Props {
  posts: [Post];
}

const Home = ({ posts } :Props) => {

  console.log(posts)
  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Medium Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <div className="flex justify-between items-center bg-yellow-400 border-y border-black py-10 lg:py-0">
        <div className="px-10 space-y-5">
          <h1 className='text-6xl max-w-xl font-serif'><span className='underline decoration-black decoration-4'>Medium</span>  is a place to write, read and connect</h1>
         <h2>
          It's easy and free to comment your thinking on any post and connect
          with me!
          </h2> 
        </div>
          
          <img 
          className='hidden md:inline-flex h-32 lg:h-full' src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png" alt="" />
      </div>


      <div className="grid grid-cols-1 gap-3 p-2 sm:grid-cols-2 md:gap-6 md:p-6 lg:grid-cols-3">
      {posts.map((post) => (
            <Link key={post._id} href={`/post/${post.slug.current}`}>
            <div className="group cursor-pointer border rounded-lg overflow-hidden">
              <img className='h-60 w-full object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out' src={urlFor(post.mainImage).url()!} alt="image"/>
              <div className="flex justify-between p-5">
               <div>
                 <p>{post.title}</p>
                 <p>{post.description} by {post.author.name}</p>
               </div>

               <img className='h-12 w-12 rounded-full' src={urlFor(post.author.image).url()!} alt="post.author.name"/> 
              </div>
            </div>  
            </Link>
          ))}
      </div>
    </div>

  )
}

export default Home

export const getServerSideProps = async () => {
  const query = `*[_type == "post"]{
    _id,
    title,
    slug,
    author ->{
    name,
    image,
  },
    description,
    mainImage,
  }`

  const posts = await sanityClient.fetch(query);

  return {
    props: {
      posts,
    },
  }
};
