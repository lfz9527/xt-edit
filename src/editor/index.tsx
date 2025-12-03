import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const Editor = () => {
  const editor = useEditor({
    // 富文本插件
    extensions: [StarterKit],
    // 初始化内容
    content: '', // initial content
    // 是否自动聚焦，也可以配置光标位置
    autofocus: 'start',
    // 编辑器读写权限
    editable: true,
  })

  return (
    <div className='editor-wrap'>
      <EditorContext.Provider value={{ editor }}>
        <EditorContent
          editor={editor}
          role='presentation'
          className='simple-editor-content'
        />
      </EditorContext.Provider>
    </div>
  )
}

export default Editor
