import PhoneFrame from "./PhoneFrame";
import { screen } from "../data/content";
const keys = ["home", "dash", "tasks", "chat", "more"];
export default function ScreenshotMarquee() {
  return (
    <div className='overflow-hidden border-y border-line py-7 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]'>
      <div className='flex gap-6 w-max animate-marquee hover:[animation-play-state:paused]'>
        {[...keys, ...keys].map((k, i) => (
          <PhoneFrame
            key={i}
            src={screen(k)}
            size={170}
            tilt={false}
            className='!rounded-[26px] !border-4'
          />
        ))}
      </div>
    </div>
  );
}
