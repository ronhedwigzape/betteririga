export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-w-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none">
      {children}
    </div>
  )
}
