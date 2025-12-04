import { useRef } from 'react'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Toolbar } from '@/components/ui-primitive/toolbar'
import { ToolBarContent } from './toolbar-content'
import './index.less'

const Editor = () => {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const editor = useEditor({
    editorProps: {
      attributes: {
        // 关闭自动填充
        autocomplete: 'off',
        // 关闭自动纠错
        autocorrect: 'off',
        // 输入英文时不自动把首字母大写
        autocapitalize: 'off',
        class: 'xt-editor',
      },
    },
    // 富文本插件
    extensions: [
      StarterKit.configure({
        // 关闭水平分割线
        horizontalRule: false,
        link: {
          // 点击链接，禁止打开浏览器
          openOnClick: false,
          // 允许点击链接时把光标选到链接上
          enableClickSelection: true,
        },
      }),
    ],
    // 初始化内容
    content: '', // initial content
    // 是否自动聚焦，也可以配置光标位置
    autofocus: 'start',
    // 编辑器读写权限
    editable: true,
  })

  return (
    <div className='xt-editor-wrap'>
      <EditorContext.Provider value={{ editor }}>
        <Toolbar ref={toolbarRef}>
          <ToolBarContent
            onLinkClick={() => {}}
            onHighlighterClick={() => {}}
          />
        </Toolbar>
        <EditorContent
          editor={editor}
          role='presentation'
          className='xt-editor-content'
        />
      </EditorContext.Provider>
    </div>
  )
}

export default Editor
