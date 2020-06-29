describe("Test filhandtering", function() {
  var filehandler;
  var fs = null;

  beforeEach(function() {
    fs = {
      writeFile: function(filename, data){}
    };
    filehandler = new LM.Filhandtering();
    LM.fs = fs;
  });

  it("kan lagre tom taleliste", function() {
    spyOn(fs, 'writeFile');
    var textToCallWith = ["ihjhsdaffadsdfsaljhi"];
    var jsonstring = JSON.stringify(textToCallWith);
    filehandler.lagreTaleliste(textToCallWith);
    expect(fs.writeFile).toHaveBeenCalledWith('data/testles.txt', jsonstring, jasmine.any(Function));
  });

  it("kan lagre fylt taleliste", function() {
    spyOn(fs, 'writeFile');
    var init0 = {id: '0'};
    var init1 = {id: '1'};
    var taleliste = [init0, init1];
    filehandler.lagreTaleliste(taleliste);
    expect(fs.writeFile).toHaveBeenCalledWith('data/testles.txt', JSON.stringify(taleliste), jasmine.any(Function));
  });

  it("kan lagre timestamp", function(){
    spyOn(fs, 'writeFile');
    filehandler.lagreTimestamp(0);
    expect(fs.writeFile).toHaveBeenCalledWith('data/timestamp.txt', 0, jasmine.any(Function));
  });

  it("kan lese timestamp", function(){
    fs.existsSync = function(filename){return true;};
    fs.readFileSync = function(filename){return "8";};
    var result = filehandler.lesTimestamp();
    expect(result).toEqual(8);
  });

});