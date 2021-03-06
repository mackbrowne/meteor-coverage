import Conf from '../context/conf';
import CoverageData from '../services/coverage-data';
import Core from '../services/core';
import ReportCommon from './report-common';
import path from 'path';
import fs from 'fs';
var istanbulAPI = Npm.require('istanbul-api'),
  Report = istanbulAPI.libReport,
  ReportImpl = istanbulAPI.reportsImpl;

export default class {
  constructor(res, type, options) {
    this.res = res;
    this.options = options;
    this.report = ReportImpl.create(type, this.options);

    this.report.file = this.options.path;
    this.context = this.getContext(this.report.file);

  }

  generate() {
    let coverage = Core.getCoverageObject();
    var root = CoverageData.getTreeReport(coverage);
    this.report.onStart(root, this.context);
    this.res.end('{"type":"success"}');
  }

  getContext(filepath) {
    const dirpath = path.dirname(filepath);
    ReportCommon.checkDirectory(dirpath);
    ReportCommon.checkFile(filepath);
    var context = Report.createContext();


    Object.defineProperty(context, 'writer', {
      value: {
        writeFile: function (path) {
          return {
            write: function (data) {
              fs.appendFileSync(path, data);
            },
            println: function (data) {
              fs.appendFileSync(path, data + '\r\n');
            },
            close: function () {
            },
            colorize: function(string) {
              return string;
            }
          };
        }
      }
    });
    return context;
  }
}
