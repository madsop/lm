describe("Test server", function() {
  var server;

  beforeEach(function(){
    server = new LM.Server();
  });

  it("kan legge til innlegg", function(){
    var innlegg = {};
    server.nyInnleggsId = function(){return "1";};
    server.nyttInnlegg(innlegg)
    expect(server.getTalelista()[0]).toEqual(innlegg);
  });

});