import Reveal from "../Reveal";
import { appDownload } from "../../data/content";
export default function DownloadBand() {
  return (
    <section id='get' className='py-16'>
      <div className='wrap'>
        <Reveal className='rounded-[28px] bg-cta text-ink p-10 md:p-14 flex flex-wrap items-center justify-between gap-8'>
          <div>
            <h2 className='text-[clamp(28px,4vw,42px)] font-semibold max-w-[16ch]'>
              Try YOVA today
            </h2>
            <p className='mt-3 max-w-[44ch] opacity-85'>
              Your day, organized, with a virtual assistant built in. Download
              it and try it now.
            </p>
          </div>
          <a
            href={appDownload.file}
            download={appDownload.filename}
            className='btn bg-ink text-cream hover:brightness-125'
          >
            Download the app
          </a>
        </Reveal>
      </div>
    </section>
  );
}
