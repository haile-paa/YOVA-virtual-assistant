import Hero from "../components/sections/Hero";
import ScreenshotMarquee from "../components/ScreenshotMarquee";
import Stats from "../components/sections/Stats";
import Showcase from "../components/sections/Showcase";
import BlogTeaser from "../components/sections/BlogTeaser";
import DownloadBand from "../components/sections/DownloadBand";
export default function Home() {
  return (
    <>
      <Hero />
      {/* <ScreenshotMarquee /> */}
      <Stats />
      <Showcase />
      <BlogTeaser />
      <DownloadBand />
    </>
  );
}
