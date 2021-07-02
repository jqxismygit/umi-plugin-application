export default function transformerBefore(ts: any, appRoot: string) {
  // console.log(ts);

  return function transformerFactory(context: any) {
    return (sourceFile: any) => {
      console.log('after ======>>', sourceFile);
      return sourceFile;
    };
  };
}
