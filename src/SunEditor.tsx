import { FC, useEffect, useRef } from "react";
import { SunEditorReactProps } from "./types/SunEditorReactProps";
import SunEditorCore from "suneditor/src/lib/core";
import getLanguage from "./misc/getLanguage";
import { getPlugins } from "./misc/getPlugins";
import suneditor from "suneditor";
import SetOptions from "./types/SetOptions";

const SunEditor: FC<SunEditorReactProps> = (props) => {
  const {
    name,
    lang,
    setOptions = {} as SetOptions,
    placeholder,
    width = "100%",
    height,
    defaultValue,
    setContents,
    setDefaultStyle,
    getSunEditorInstance,
    appendContents,
    disable = false,
    hide = false,
    hideToolbar = false,
    disableToolbar = false,
    onChange,
    autoFocus,
    onBlur,
    onLoad,
    toggleCodeView,
    toggleFullScreen,
    showInline,
    showController,
    imageUploadHandler,
  } = props;
  const txtArea = useRef<HTMLTextAreaElement>(null);
  const editor = useRef<SunEditorCore>();


  useEffect(() => {
    setOptions.lang = setOptions.lang || getLanguage(lang);
    setOptions.plugins = getPlugins(setOptions);
    setOptions.width = setOptions.width || width;

    if (height) setOptions.height = height;

    if (name && defaultValue) txtArea.current!.value = defaultValue;

    editor.current = suneditor.create(txtArea.current!, {
      value: defaultValue,
      ...setOptions,
      lang: setOptions.lang as any,
    });

    if (getSunEditorInstance) getSunEditorInstance(editor.current);

    editor.current.onChange = (content) => {
      if (name && txtArea.current) txtArea.current.value = content;
      if (onChange) onChange(content);
    };

    if (onBlur)
      editor.current.onBlur = (e) =>
        editor.current && onBlur(e, editor.current.getContents(true));

    const fromClipBoardEvents = ["onCopy", "onCut"] as const;
    const singleEvents = [
      "onMouseDown",
      "onScroll",
      "onInput",
      "onClick",
      "onKeyUp",
      "onKeyDown",
      "onFocus",
    ] as const;
    const uploadBeforeEvents = [
      "onImageUploadBefore",
      "onVideoUploadBefore",
      "onAudioUploadBefore",
    ] as const;
    const uploadEvents = [
      "onImageUpload",
      "onImageUpload",
      "onAudioUpload",
      "onVideoUpload",
    ] as const;
    const uploadErrorEvents = [
      "onImageUploadError",
      "onVideoUploadError",
      "onAudioUploadError",
    ] as const;
    const toClipBoardEvents = ["onDrop", "onPaste"] as const;

    fromClipBoardEvents.forEach((event) => {
      const value = props[event];

      if (editor.current && event && value)
        editor.current[event] = (e, clipboardData) =>
          value(e as ClipboardEvent, clipboardData);
    });
    singleEvents.forEach((event) => {
      const value = props[event];

      if (editor.current && event && value)
        editor.current[event] = (e) => value(e as any);
    });
    uploadBeforeEvents.forEach((event) => {
      const value = props[event];

      if (editor.current && event && value)
        editor.current[event] = (
          files: Array<File>,
          info: object,
          _: any,
          uploadHandler: Function
        ) => value(files, info, uploadHandler) as any;
    });
    uploadEvents.forEach((event) => {
      const value = props[event];

      if (editor.current && event && value)
        editor.current[event] = (
          targetElement: any,
          index: number,
          state: string,
          info: object,
          remainingFilesCount: number
        ) =>
          value(targetElement, index, state, info, remainingFilesCount) as any;
    });
    uploadErrorEvents.forEach((event) => {
      const value = props[event];

      if (editor.current && event && value)
        editor.current[event] = (errorMessage, result: any) =>
          value(errorMessage, result) as any;
    });
    toClipBoardEvents.forEach((event) => {
      const value = props[event];

      if (editor.current && event && value)
        editor.current[event] = (e, cleanData, maxCharCount) =>
          value(
            e as DragEvent & ClipboardEvent,
            cleanData,
            maxCharCount as any
          ) as any;
    });

    editor.current!.onload = (_, reload) => {
      if (reload === false) {
        if (setContents) {
          editor.current!.setContents(setContents);
          editor.current!.core.focusEdge(null);
        }
        if (setDefaultStyle) editor.current!.setDefaultStyle(setDefaultStyle);
        if (appendContents) editor.current!.appendContents(appendContents);

        if (editor.current!.util.isIE)
          (editor.current!.core as any)._createDefaultRange();
        if (disable === true) editor.current!.disabled();
        if (hide === true) editor.current!.hide();
        if (hideToolbar === true) editor.current!.toolbar.hide();
        if (disableToolbar === true) editor.current!.toolbar.disabled();

        if (autoFocus === false)
          (editor.current!.core.context.element.wysiwyg as any).blur();
        else if (autoFocus === true)
          (editor.current!.core.context.element.wysiwyg as any).focus();
      }

      if (onLoad) onLoad(reload);
    };

    if (imageUploadHandler && typeof imageUploadHandler === "function")
      editor.current!.imageUploadHandler = imageUploadHandler;
    if (toggleCodeView && typeof toggleCodeView === "function")
      editor.current!.toggleCodeView = (isCodeView) =>
        toggleCodeView(isCodeView);
    if (toggleFullScreen && typeof toggleFullScreen === "function")
      editor.current!.toggleFullScreen = (isFullScreen) =>
        toggleFullScreen(isFullScreen);
    if (showInline && typeof showInline === "function")
      editor.current!.showInline = (toolbar, context) =>
        showInline(toolbar, context);
    if (showController && typeof showController === "function")
      editor.current!.showController = (name, controllers) =>
        showController(name as any, controllers);

    return () => {
      if (editor.current) editor.current.destroy();
    };
  }, []);

  useEffect(() => {
    editor.current?.setOptions({
      lang: getLanguage(lang),
      placeholder,
      height,
      width,
    });
  }, [lang, placeholder, height, width]);

  useEffect(() => {
    if (setDefaultStyle) editor.current?.setDefaultStyle(setDefaultStyle);
  }, [setDefaultStyle]);

  useEffect(() => {
    if (setContents) editor.current?.setContents(setContents);
  }, [setContents]);

  useEffect(() => {
    if (appendContents) editor.current?.appendContents(appendContents);
  }, [appendContents]);

  useEffect(() => {
    if (disable === true) editor.current?.disabled();
    else editor.current?.enabled();

    if (hideToolbar === true) editor.current?.toolbar.hide();
    else editor.current?.toolbar.show();

    if (disableToolbar === true) editor.current?.toolbar.disabled();
    else editor.current?.toolbar.enabled();

    if (hide === true) editor.current?.hide();
    else editor.current?.show();
  }, [disable, hideToolbar, disableToolbar, hide]);

  return (
    <textarea style={{ visibility: "hidden" }} ref={txtArea} {...{ name }} />
  );
};

export default SunEditor;