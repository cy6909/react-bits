// Authored specifications; not records of a successful generation run.
const commonZh = `使用 React 函数组件与独立 CSS，提供完整文件和最小使用示例。不得读取现成组件源码、技能、记忆或父会话历史，不安装无关依赖。不改变项目其它区域。样式使用独立命名空间，支持多个实例；卸载清理监听器与计时器。提供桌面与375px窄屏布局，键盘可操作，尊重 prefers-reduced-motion。使用本地渐变或用户提供的素材，不依赖远程图片。完成后自行检查首次交互、快速连续操作、重置、窄屏与卸载；不得凭构建成功宣称视觉验收。`;
const commonEn = `Use React function components and scoped CSS. Return complete files and a minimal usage example. Do not read existing implementation source, skills, memory, or parent conversation history. Avoid unrelated dependencies and edits. Support multiple instances, keyboard input, 375px mobile layouts, and prefers-reduced-motion. Clean up listeners and timers on unmount. Use local gradients or supplied assets, never remote image dependencies. Check first interaction, rapid repetition, reset, mobile layout and unmount. A successful build is not visual acceptance.`;

export const prompts = {
  DepthCarousel: {
    zh: `${commonZh}\n\n目标：制作“纵深轮播”组件。容器深色 #0c0c10，宽100%、高520px、perspective 1400px。数据为6张有 id/title/color 的卡片，中心卡片桌面300×380px、圆角18px，标题位于左下。窄屏卡片宽为 min(72vw,300px)，舞台高440px。\n对每张卡片计算相对于当前索引的最短循环距离 d，最多显示 |d|≤2：translateX=d×90px，translateZ=-abs(d)×220px，rotateY=-sign(d)×22deg，opacity=max(0,1-abs(d)×0.2)。中心层级最高；离中心越远模糊越强，每层3px。切换通过700ms cubic-bezier(.22,1,.36,1) 过渡，从当前位置继续，不先跳回初态。\n提供上一个、下一个、圆点与左右箭头键控制，焦点仅在组件内响应。默认不自动播放；自动播放开关打开后每3200ms前进一次，用户手动操作清除旧计时再计时；页面隐藏和鼠标悬停暂停。按钮带可访问名称，当前圆点使用 aria-current。重置取消定时器并恢复索引0。reduced-motion 下去掉旋转、模糊和过渡但保持切换。\n验收：只有一张中心卡；连续点击10次索引和内容一致；末张可以循环到首张；中文长标题不溢出；没有图片仍能识别6个不同卡片；卸载后没有自动切换。`,
    en: `${commonEn}\n\nCreate a depth carousel: dark #0c0c10 stage, full width, 520px height, 1400px perspective. Six items have id, title, color. Center card is 300×380px, radius18px, title at bottom left; on mobile width min(72vw,300px), stage440px.\nCompute shortest wrapped offset d from active index. Show |d|≤2: translateX=d*90px, translateZ=-abs(d)*220px, rotateY=-sign(d)*22deg, opacity=max(0,1-abs(d)*.2), blur=abs(d)*3px. Center card has highest z-index. Animate from current transforms for700ms using cubic-bezier(.22,1,.36,1).\nProvide previous/next, dots and focused left/right keyboard controls. Autoplay off by default; when enabled advance every3200ms, pause on hover/hidden document, reset its timer after manual input. Reset cancels timers and restores index0. Reduced motion disables transforms/blur/transitions but preserves navigation.\nVerify one active card, ten rapid clicks with consistent content/index, last-to-first wrap, long Chinese titles, distinguishable cards without images, and no timer after unmount.`
  },
  BlurText: {
    zh: `${commonZh}\n\n制作模糊渐显文字组件。默认文案“让灵感，成为可复用的界面。”，桌面48px/1.4、窄屏30px/1.5，无衬线，白色文字，深色背景，最大宽度760px，保留标点与空格。按 Unicode 字符切分，为屏幕阅读器提供完整文本，动画碎片 aria-hidden。\n初始每个字符 opacity0、translateY(18px)、filter blur(10px)。从挂载t=0开始第i字符延迟i×45ms，用600ms cubic-bezier(.22,1,.36,1) 过渡到opacity1、y0、blur0。总完成时间为600+(字符数-1)×45ms，通过最后一个动画结束报告 onComplete，空文本立即完成。\n按钮“重新播放”应在完成后出现，点击从初始状态重播；取消上轮回调，避免连续重播旧任务触发完成。reduced-motion直接显示全部文本并立即完成。检查emoji不裂开、中文换行自然、空字符串、连续重播与卸载清理。`,
    en: `${commonEn}\n\nBuild blur-reveal text with default text “Let inspiration become an interface.” Desktop48px/1.4, mobile30px/1.5, white sans-serif on dark, max-width760px. Split Unicode characters while preserving punctuation and spaces; expose full text to assistive technology and aria-hide animated fragments.\nEach character starts opacity0, translateY18px, blur10px. Character i delays i*45ms and animates over600ms cubic-bezier(.22,1,.36,1) to opacity1, y0, blur0. Call onComplete from the final animation end; empty input completes immediately. Show Replay after completion. Restart cancels previous completion work. Reduced motion shows text and completes immediately. Check emoji, wrapping, empty input, repeated replay and cleanup.`
  },
  SpotlightCard: {
    zh: `${commonZh}\n\n制作指针聚光卡片。卡片宽min(100%,400px)、最小高260px、内边距32px、圆角24px，背景#111116，边框1px #292932。内容包括小图标、标题“聚光灯卡片”和一段两行描述，禁止添加无关指标。\n指针进入后读取卡片坐标，以clientX-left和clientY-top更新CSS变量--spot-x/--spot-y。伪元素pointer-events:none，使用radial-gradient(220px circle at var(--spot-x) var(--spot-y),rgba(167,139,250,.23),transparent 70%)，opacity从0过渡至1，200ms ease-out；离开在300ms内淡出。仅使用一个requestAnimationFrame更新坐标，避免每个pointermove触发React重渲染。\n键盘focus-visible时光晕固定居中且显示焦点边框；触屏点击显示中心光晕，第二次点击复位，卡片内容按钮保持可点击。reduced-motion无淡入淡出。验收多实例互不影响、滚动后光晕仍跟随、快速进出不残留、不会挡住按钮和焦点，卸载取消帧请求。`,
    en: `${commonEn}\n\nBuild a pointer spotlight card: width min(100%,400px), min-height260px, padding32px, radius24px, background#111116, 1px #292932 border. Include a small icon, “Spotlight card” heading and a two-line description; no unrelated metrics.\nOn pointer movement compute local coordinates from clientX-left/clientY-top and update --spot-x/--spot-y with one queued requestAnimationFrame, not React state per event. A pointer-events:none overlay uses radial-gradient(220px circle at var(--spot-x) var(--spot-y),rgba(167,139,250,.23),transparent 70%). Enter opacity0→1 over200ms ease-out; leave fades over300ms.\nKeyboard focus shows centered spotlight and a focus ring. Touch toggles a centered light without blocking child controls. Reduced motion removes fades. Verify independent instances, correct coordinates after scrolling, rapid enter/leave, clickable children and canceled animation frame on unmount.`
  }
};
export const promptNames = Object.keys(prompts);
export const provenance = {
  origin: 'upstream',
  agent: null,
  model: null,
  reasoningEffort: null,
  skillsLoaded: null,
  attempts: null,
  reproductionStatus: 'unverified'
};
