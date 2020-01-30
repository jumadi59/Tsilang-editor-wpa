<?php

class tts {

    function createProject($userName) {
        $dir = "";
        $fileName = $userName.".json";
        $file = fopen($dir. '/' .$fileName, "w");
        fwrite($file,"[]");
        fclose($file);
    }

    function saveProject($projectId, $dataadd) {
        $dirFile = "data/".$projectId;
        $levels = file_get_contents($dirFile);

        $data = json_decode($levels, true);
        $dataadd = json_decode($dataadd, true);
        $dataSize = count($data);

        foreach ($dataadd as $key => $d) {
            $data[$dataSize+key] = $d;
        }

        $jsonfile = json_encode($data, JSON_PRETTY_PRINT);
        file_put_contents($dirFile, $jsonfile);
    }

    function deleteLevel($projectId, $indexLevel) {
        $dirFile = "data/".$projectId;
        $levels = file_get_contents($dirFile);

        $data = json_decode($levels, true);

        unset($data[$indexLevel]);
        $jsonfile = json_encode($data, JSON_PRETTY_PRINT);
        file_put_contents($dirFile, $jsonfile);
    }

    function getLevels($projectId, $indexLevel) {
        $dirFile = "data/".$projectId;
        $levels = file_get_contents($dirFile);

        $data = json_decode($levels, true);

        return $data;
    }

    function getLevelWithIndex($projectId, $startIndex) {
        $dirFile = "data/".$projectId;
        $levels = file_get_contents($dirFile);

        $data = json_decode($levels, true);

        $newData = [];

        foreach ($data as $key => $d) {
            if ($key >= $startIndex) {
                $newData[$key] = $d;
            }
        }

        return $newData;
    }

}
