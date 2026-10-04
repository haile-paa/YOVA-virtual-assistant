import Hero from '../sections/Hero'
import Features from '../sections/Features'
import ChatDemo from '../sections/ChatDemo'
import Explorer from '../sections/Explorer'
import BlogPreview from '../sections/BlogPreview'
import DownloadCta from '../sections/DownloadCta'
import Faq from '../sections/Faq'
import { usePageTitle } from '../hooks'

export default function Home() {
  usePageTitle('')
  return (
    <>
      <Hero />
      <Features />
      <ChatDemo />
      <Explorer />
      <BlogPreview />
      <DownloadCta />
      <Faq />
    </>
  )
}
