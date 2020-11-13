/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {Text, SafeAreaView} from 'react-native';

import tape from 'tape';
import suite from 'abstract-leveldown/test';
import ReactNativeLeveldown from 'react-native-leveldown';
import LevelUp from 'levelup';
import {Buffer} from 'buffer';

const App: () => React$Node = () => {
  const [logs, setLogs] = React.useState('Running tests...');
  const [sec, setSec] = React.useState('Waiting.');
  React.useEffect(() => {
    global.__dirname = '<unknown dir name>';
    const test = tape.createHarness();

    let newLogs = '';
    let testCount = 0;
    let failedTests = [];
    test
      .createStream({objectMode: true})
      .on('data', function (row) {
        if (row.type === 'test') {
          console.log(`Running test '${row.name}'`);
        }
        if (row.type === 'assert') {
          testCount++;
          if (!row.ok) {
            failedTests.push(row);
          }
          const log = `${row.name || '(no name)'}: ${
            row.ok ? 'OK' : `FAILED (${JSON.stringify(row, null, '\t')})`
          }`;
          console.log(log);
          if (!row.ok) {
            newLogs += `${log}\n`;
          }
        }
      })
      .on('end', function (row) {
        newLogs += `Ran ${testCount} tests; ${failedTests.length} failed`;
        setLogs(newLogs);

        async function test() {
          const db = LevelUp(
            new ReactNativeLeveldown(Math.random().toString()),
          );
          await db.put('key', Buffer.from([1, 2, 3, 0, 4, 5, 6]));
          const res = await db.get('key');
          setSec('Result from key was: ' + JSON.stringify(res));
          await db.close();
        }

        test().then(() => console.log('Test done!')).catch(console.error);
      });

    const testCommon = suite.common({
      test,
      factory: function () {
        return new ReactNativeLeveldown(Math.random().toString());
      },
    });

    suite(testCommon);
  }, []);
  return (
    <SafeAreaView style={{flex: 1, overflow: "scroll"}}>
      <Text style={{flex: 1}}>{logs}</Text>
      <Text style={{flex: 1}}>{sec}</Text>
    </SafeAreaView>
  );
};

export default App;
