export default function transformerBefore(ts: any, appRoot: string) {
  // console.log(ts);
  console.log('appRoot ======>>', appRoot);
  return function transformerFactory(context: any) {
    return (sourceFile: any) => {
      // console.log('sourceFile.filename = ', sourceFile);
      const visitor = (node: any): any => {
        if (
          ts.isImportDeclaration(node) &&
          sourceFile.fileName.endWith('manifest.ts')
        ) {
          console.log('node ---------------->>>');
          return undefined;
        }
        return ts.visitEachChild(node, visitor, context);
      };
      const sc = ts.visitNode(sourceFile, visitor);
      // console.log('sc ==============>>> ', sc);
      return sc;
    };
  };
}
