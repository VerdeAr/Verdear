{
  description = "Bun development environment for Verdear";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    devShells.${system}.default = pkgs.mkShell {
      packages = with pkgs; [ 
        bun
      ];

      LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath (with pkgs; [
        stdenv.cc.cc.lib
        zlib
      ]);
    };
  };
}
