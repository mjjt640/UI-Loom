export function App() {
  return (
    <div className="h-screen w-screen bg-stone-100 text-stone-900">
      <div className="grid h-full grid-cols-[240px_1fr_320px]">
        <aside className="border-r border-stone-200 bg-white p-4">图层区</aside>
        <main className="bg-stone-50 p-4">画布区</main>
        <aside className="border-l border-stone-200 bg-white p-4">属性区</aside>
      </div>
    </div>
  )
}
