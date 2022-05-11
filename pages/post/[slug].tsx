import { PortableTextEditable } from "@sanity/portable-text-editor";
import { GetStaticProps } from "next";
import PortableText from "react-portable-text";
import Header from "../../components/Header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typying";
import { useForm, SubmitHandler } from 'react-hook-form'
import { useState } from 'react'

interface Props{
    post: Post;

}

interface IFormInput {
    _id: string;
    name: string;
    email: string;
    comment: string;
} 
function post({ post }: Props) {
    const [submitted, setSubmitted] = useState(false)

    console.log(post)
    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm<IFormInput>();

      const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        await fetch('/api/createComment', {
          method: 'POST',
          body: JSON.stringify(data),
        })
          .then(() => {
           console.log(data)
           setSubmitted(true)
          })
          .catch((err) => {
            console.log('error', err)
            setSubmitted(false)
          })
      }

  return( <main>
      <Header/>
      <img className="w-full h-40 object-cover" src={urlFor(post.mainImage).url()!} alt="" />

      <article className="max-w-3xl mx-auto p-5">
          <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
          <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>

          <div className="flex items-center space-x-3">
          <img className="h-10 w-10 rounded-full" src={urlFor(post.author.image).url()!} alt=""
          />  
           <p className="font-extralight text-sm">
           Blog post by <span className="text-green-600">{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}
      </p> 
          </div>

          <div className="mt-10">
              <PortableText
                dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
                content={post.body}
                serializers={{
                    h1: (props: any) => (
                      <h1 className="my5 text-2xl font-bold" {...props} />
                    ),
                    h2: (props: any) => (
                      <h1 className="my5 text-xl font-bold" {...props} />
                    ),
                    li: ({ children }: any) => (
                      <li className="ml-4 list-disc"> {children}</li>
                    ),
                    link: ({ href, children }: any) => (
                      <a href={href} className="text-blue-500 hover:underline">
                        {' '}
                        {children}
                      </a>
                    ),
                  }}
                />
            </div>
          
      </article>
      <hr className="my-5 mx-auto max-w-lg border border-yellow-500" />

      {submitted ? (
          <div className="my-10 mx-auto flex max-w-2xl flex-col gap-3 bg-yellow-500 p-10 text-white">
              <h3 className="text-3xl font-bold">Thank you for submitting your comment!</h3>
              <p>Once it has been aprooved, it will be visible below.</p>
          </div>
      ): (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-5 my-10 max-w-2xl mx-auto mb-10">
      <h3 className="text-sm capitalize text-yellow-500">
                enjoyed this article?
              </h3>
       <h3 className="cap text-3xl font-bold">Leave a comment below!</h3>
        <hr className="mt-2 py-3" />


        <input
                {...register("_id")}
                type="hidden"
                name="_id"
                value={post._id}
              />
          <label className="block mb-5">
              <span className=" text-gray-700">Name</span>
              <input 
              {...register('name',{required: true})}
              className="shadow border rounded py-2 px-3 form-input w-full ring-yellow-500 outline-none focus:ring" placeholder="John Apkolo" type="text"/>
          </label>
          <label className="block mb-5">
              <span className="text-gray-700">Email</span>
              <input 
              {...register('email',{required: true})}
              className="shadow border rounded py-2 px-3 form-input w-full ring-yellow-500 outline-none focus:ring" placeholder="JohnApkolo@email.com" type="text"  />
          </label>
          <label className="block mb-5">
              <span className="text-gray-700">Comment</span>
              <textarea 
              {...register('comment',{required: true})}
              className="shadow border py-2 px-3 form-textarea mt-1 block w-full outline-none ring-yellow-500 focus:ring" placeholder="Type something"  rows={8}/>
          </label>

          {/*error will return when field validation fails*/}

          <div className="flex flex-col p-5">
                {errors.name && (
                  <span className="text-red-500">
                    - The Name Field is required
                  </span>
                )}
                {errors.comment && (
                  <span className="text-red-500">
                    - The Comment Field is required
                  </span>
                )}
                {errors.email && (
                  <span className="text-red-500">
                    - The Email Field is required
                  </span>
                )}
              </div>
              <input
                type="submit"
                className="focus:shadow-outline focus:otline-none rounded cursor-pointer bg-yellow-500 py-2 px-4 font-bold capitalize text-white hover:bg-yellow-400"
                value="submit"
              />
      </form>  
      )} 
      <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2">
          <h3 className="text-4xl">Comments</h3>
          <hr className="pb-2" />

          {post.comments.map((comment) => (
              <div key={comment._id} className="">
                <p>
                  <span className="text-yellow-500">{comment.name}</span> says '
                  {comment.comment}'
                </p>
              </div>
            ))}
      </div>
       

  </main>
  );
}

export default post;

export const getStaticPaths = async () =>{
    const query = `*[_type == "post"]{
        _id,
        title,
        slug {
      current
    }
      }`;

    const posts = await sanityClient.fetch(query);

    const paths = posts.map((post: Post) => ({
        params: {
            slug: post.slug.current
        },
    }))

    return{
        paths,
        fallback: "blocking",
    }
}

export const getStaticProps: GetStaticProps = async({ params }) =>{
    const query = `*[_type=="post" && slug.current==$slug][ 0]{
        _id,
      _createdAt,
      title,
      author->{
      name,
      image,
    },
    'comments': *[
        _type=="comment" &&
        post._ref==^._id &&
        approved==true],
      categories,
      'allcategories':*[
        _type=="category"
      ],
    description,
    mainImage,
    slug,
    body,
    }`

    const post = await sanityClient.fetch(query, {
        slug: params?.slug,
    });

    if (!post) {
        return{
            notFound : true
        }
    }

    return{
        props:{
            post,
        },
        revalidate: 60,
    }

}
