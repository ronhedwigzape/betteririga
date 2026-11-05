export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-w-0 animate-in fade-in-0 duration-150 motion-reduce:animate-none">
      {children}
    </div>
  )
}
